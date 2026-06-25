import { Chess, Move, PieceSymbol } from "chess.js";
import { chessGames, DbGameState, games, GameState, LastMove } from "../stores/games";
import { Challenge } from "@/store/challengeStore";
import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const pieceValues = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
} as const;

const calculateMaterial = (chess: Chess) => {
	let whiteMaterial = 0;
	let blackMaterial = 0;

	for (const row of chess.board()) {
		for (const piece of row) {
			if (!piece) continue;

			const value = pieceValues[piece.type];

			if (piece.color === "w") {
				whiteMaterial += value;
			} else {
				blackMaterial += value;
			}
		}
	}

	const material = {
		white: whiteMaterial,
		black: blackMaterial,
		advantage: whiteMaterial - blackMaterial,
	};

	return material;
}

export const updateGameState = (game: GameState, chess: Chess, move?: Move | null) => {
	game.fen = chess.fen();

	if (move) {
		game.lastMove = {
			from: move.from,
			to: move.to,
			piece: move.piece,
			color: move.color,
			captured: move.captured,
			san: move.san
		};

		if (move.isCapture() && move.captured) {
			if (move.color === "w") {
				game.whitesCapturedPieces.push(move.captured);
			} else {
				game.blacksCapturedPieces.push(move.captured);
			}
		}

		if (move.isPromotion()) {
			if (move.color === "w") {
				game.blacksCapturedPieces.push("p");
			} else {
				game.whitesCapturedPieces.push("p");
			}
		}

		game.material = calculateMaterial(chess);
	}

	game.history = chess.history();

	game.turn = chess.turn();

	game.status = {
		isCheck: chess.isCheck(),
		isCheckMate: chess.isCheckmate(),
		isDraw: chess.isDraw(),
		isGameOver: game.result !== ""
			? true
			: chess.isGameOver(),
		isStalemate: chess.isStalemate(),
		isThreefoldRepetition:
			chess.isThreefoldRepetition(),
		isInsufficientMaterial:
			chess.isInsufficientMaterial(),
	};

	if (game.result === "") {
		if (chess.isCheckmate()) {
			game.result = "checkmate";

			game.winner = chess.turn() === "w"
				? "b"
				: "w";
		} else if (
			chess.isStalemate() ||
			chess.isDraw() ||
			chess.isThreefoldRepetition() ||
			chess.isInsufficientMaterial()
		) {
			game.result = chess.isStalemate()
				? "stalemate"
				: "draw";

			game.winner = "draw";
		}

		game.status.isGameOver = chess.isGameOver();
	}

	return game;
}

export const initializeGame = (gameId: string, chess: Chess, challenge: Challenge) => {
	const game: GameState = {
		gameId: gameId,
		fen: chess.fen(),
		history: chess.history(),
		turn: chess.turn(),
		whitePlayerId: challenge.fromUserId,
		whitePlayerUsername: challenge.fromUsername,
		blackPlayerId: challenge.toUserId,
		blackPlayerUsername: challenge.toUsername,
		status: {
			isCheck: false,
			isCheckMate: false,
			isDraw: false,
			isGameOver: false,
			isStalemate: false,
			isThreefoldRepetition: false,
			isInsufficientMaterial: false,
		},
		lastMove: null,
		whitesCapturedPieces: [],
		blacksCapturedPieces: [],
		material: {
			white: 0,
			black: 0,
			advantage: 0
		},
		winner: "",
		resignedBy: "",
		result: ""
	}

	return game;
}

export const convertGameToGameState = (
	game: DbGameState,
	chess: Chess
): GameState => {
	const history =
		chess.history({
			verbose: true
		})

	const last = history.at(-1);

	const lastMove: LastMove | null = last
		? {
			from: last.from,
			to: last.to,
			piece: last.piece,
			color: last.color,
			captured: last.captured,
			san: last.san,
		}
		: null;

	const whitesCapturedPieces: PieceSymbol[] = [];
	const blacksCapturedPieces: PieceSymbol[] = [];

	for (const move of history) {
		if (move.captured) {
			if (move.color === "w") {
				whitesCapturedPieces.push(move.captured);
			} else {
				blacksCapturedPieces.push(move.captured);
			}
		}

		if (move.promotion) {
			if (move.color === "w") {
				blacksCapturedPieces.push("p");
			} else {
				whitesCapturedPieces.push("p");
			}
		}
	}

	const gameState: GameState = {
		gameId: game.id,

		fen: "",

		lastMove: lastMove,

		history: [],

		turn: chess.turn(),

		status: {
			isCheck: false,
			isCheckMate: false,
			isDraw: false,
			isGameOver: false,
			isStalemate: false,
			isThreefoldRepetition: false,
			isInsufficientMaterial: false,
		},

		material: calculateMaterial(chess),

		whitesCapturedPieces: whitesCapturedPieces,
		blacksCapturedPieces: blacksCapturedPieces,

		whitePlayerId: game.whitePlayerId,
		whitePlayerUsername: game.whitePlayerUsername,

		blackPlayerId: game.blackPlayerId,
		blackPlayerUsername: game.blackPlayerUsername,

		winner: (game.winner ?? "") as GameState["winner"],
		resignedBy: (game.resignedBy ?? "") as GameState["resignedBy"],
		result: (game.result ?? "") as GameState["result"],
	};

	return updateGameState(
		gameState,
		chess,
		null
	);
};

export const initializeGames = async () => {
	const activeGames = await db
		.select()
		.from(gamesTable)
		.where(eq(gamesTable.status, "active"));

	for (const game of activeGames) {
		const chess = new Chess();

		if (game.pgn) {
			chess.loadPgn(game.pgn);
		}

		games.set(game.id, convertGameToGameState(game, chess));
		chessGames.set(game.id, chess);
	}
}