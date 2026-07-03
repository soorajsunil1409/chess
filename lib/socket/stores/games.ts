import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { convertGameToGameState, initializeGame, updateGameState } from "@/lib/chess";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { eq } from "drizzle-orm";
import { Challenge } from "./challenges";
import { updateGameDraw, updateGameResignation } from "@/lib/db/dbGameUpdate";

export type LastMove = {
	from: Square,
	to: Square,
	piece: PieceSymbol,
	color: Color,
	captured: PieceSymbol | undefined,
	san?: string,
}

export type DbGameState = {
	id: string;
	whitePlayerId: string;
	blackPlayerId: string;
	whitePlayerUsername: string;
	blackPlayerUsername: string;
	fen: string;
	pgn: string;
	status: "active" | "finished";
	winner: "w" | "b" | "draw" | null;
	resignedBy: "w" | "b" | "" | null;
	result:
	| ""
	| "draw"
	| "checkmate"
	| "stalemate"
	| "resignation"
	| "threefold"
	| "insufficient"
	| null;
	startedAt: Date;
	endedAt: Date | null;
}

export type GameState = {
	gameId: string;

	fen: string;

	lastMove: LastMove | null;

	history: string[],

	turn: Color;

	status: {
		isCheck: boolean;
		isCheckMate: boolean;
		isDraw: boolean;
		isGameOver: boolean;
		isStalemate: boolean;
		isThreefoldRepetition: boolean;
		isInsufficientMaterial: boolean;
	};

	material: {
		white: number;
		black: number;
		advantage: number;
	};

	whitesCapturedPieces: PieceSymbol[];
	blacksCapturedPieces: PieceSymbol[];

	whitePlayerId: string;
	whitePlayerUsername: string;
	blackPlayerId: string;
	blackPlayerUsername: string;

	winner: Color | "draw" | "";
	resignedBy: Color | "";
	result: "checkmate" | "stalemate" | "draw" | "threefold" | "insufficient" | "resignation" | "";
};

export class GamesStore {
	games = new Map<string, GameState>();
	chessGames = new Map<string, Chess>();

	async init() {
		const activeGames = await db
			.select()
			.from(gamesTable)
			.where(eq(gamesTable.status, "active"));

		for (const dbGame of activeGames) {
			const chess = new Chess();

			if (dbGame.pgn) {
				chess.loadPgn(dbGame.pgn);
			}

			const game = convertGameToGameState(dbGame, chess);

			this.games.set(game.gameId, game);
			this.chessGames.set(game.gameId, chess);
		}
	}

	getGame(gameId: string) {
		return this.games.get(gameId);
	}

	getChess(gameId: string) {
		return this.chessGames.get(gameId);
	}

	joinGame(gameId: string, userId: string) {
		const validation = this.validateGame(gameId, userId);

		if (!validation.success) return {
			success: false,
			error: validation.message
		} as const;

		return {
			success: true,
			game: validation.game,
			chess: validation.chess
		}
	}

	move(
		gameId: string,
		from: string,
		to: string,
		promotion: string,
		userId: string
	) {
		const validation = this.validateGame(gameId, userId);

		if (!validation.success) {
			return {
				success: false,
				error: validation.message,
			} as const;
		}

		const { game, chess } = validation;

		const playerColor =
			game.whitePlayerId === userId ? "w" : "b";

		if (playerColor !== chess.turn()) {
			return {
				success: false,
				error: "Not your turn",
			} as const;
		}

		try {
			const move = chess.move({
				from,
				to,
				promotion,
			});

			if (!move) {
				return {
					success: false,
					error: "Invalid move",
				} as const;
			}

			const newGame = updateGameState(game, chess, move);
			this.updateGame(newGame);

			return {
				success: true,
				game: newGame,
				chess,
				move,
			};
		} catch {
			return {
				success: false,
				error: "Invalid move",
			} as const;
		}
	}

	async resign(gameId: string, userId: string) {
		const validation = this.validateGame(gameId, userId);

		if (!validation.success) {
			return {
				success: false,
				error: validation.message,
			};
		}

		const { game, chess } = validation;

		const resignedColor = game.whitePlayerId === userId
			? "w"
			: "b";

		const winner = resignedColor === "w"
			? "b"
			: "w";

		const { success, error } = await updateGameResignation(gameId, resignedColor, winner, chess);

		if (!success) {
			return {
				success: false,
				error: error || "DB update error",
			};
		}

		game.winner = winner;
		game.resignedBy = resignedColor;
		game.result = "resignation";
		game.status.isGameOver = true;

		return {
			success: true,
			game
		};
	}

	getOpponentId(gameId: string, userId: string) {
		const validation = this.validateGame(gameId, userId);

		if (!validation.success) {
			return {
				success: false,
				error: validation.message,
			} as const;
		}

		const { game } = validation;

		const opponentId = userId === game.whitePlayerId ? game.blackPlayerId : game.whitePlayerId;

		return {
			success: true,
			opponentId
		} as const;
	}

	async acceptDraw(gameId: string, userId: string) {
		const validation = this.validateGame(gameId, userId);

		if (!validation.success) {
			return {
				success: false,
				error: validation.message,
			} as const;
		}

		const { game, chess } = validation;

		const opponentId = userId === game.whitePlayerId ? game.blackPlayerId : game.whitePlayerId;

		const { success, error } = await updateGameDraw(gameId, chess);

		if (!success) {
			return {
				success: false,
				error: error || "DB update error",
			};
		}

		game.winner = "draw";
		game.result = "draw";
		game.status.isGameOver = true;

		return {
			success: true,
			game,
			opponentId
		}
	}

	async createGame(challenge: Challenge) {
		const gameId = crypto.randomUUID();

		const newChess = new Chess();
		const game = initializeGame(gameId, newChess, challenge);

		this.games.set(gameId, game);
		this.chessGames.set(gameId, newChess);

		try {
			await db.insert(gamesTable).values({
				id: gameId,

				whitePlayerId: game.whitePlayerId,
				blackPlayerId: game.blackPlayerId,

				whitePlayerUsername: game.whitePlayerUsername,
				blackPlayerUsername: game.blackPlayerUsername,

				fen: newChess.fen(),
				pgn: newChess.pgn(),

				status: "active",
			});

			return {
				success: true,
				gameId: gameId
			}
		} catch (error) {
			this.deleteGame(gameId);

			return {
				success: false,
				error: "Game creation failed"
			};
		}
	}

	deleteGame(gameId: string) {
		this.games.delete(gameId);
		this.chessGames.delete(gameId);
	}

	hasGame(gameId: string) {
		return this.games.has(gameId);
	}

	updateGame(game: GameState) {
		this.games.set(game.gameId, game);
	}

	validateGame(
		gameId: string,
		userId: string
	):
		| { success: true; game: GameState; chess: Chess }
		| { success: false; message: string } {

		const game = this.getGame(gameId);

		if (!game) {
			return {
				success: false,
				message: "Game does not exist",
			};
		}

		if (
			game.whitePlayerId !== userId &&
			game.blackPlayerId !== userId
		) {
			return {
				success: false,
				message: "You are not part of this game",
			};
		}

		if (game.result !== "") {
			return {
				success: false,
				message: "Game has already ended",
			};
		}


		const chess = this.getChess(gameId);

		if (!chess) {
			return {
				success: false,
				message: "Game error",
			};
		}

		return {
			success: true,
			game,
			chess,
		};
	}
}