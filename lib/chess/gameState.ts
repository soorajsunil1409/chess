import { Chess, Move, PieceSymbol } from "chess.js";
import { DbGameState, GameState, LastMove } from "../socket/stores/games";
import { calculateMaterial } from "./material";
import { getGameStatus } from "./status";
import { Challenge } from "@/store/challengeStore";

export const getDynamicGameState = (chess: Chess) => {
	const history = chess.history({ verbose: true });

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

	return {
		fen: chess.fen(),

		lastMove,

		history: chess.history(),

		turn: chess.turn(),

		status: {
			isCheck: chess.isCheck(),
			isCheckMate: chess.isCheckmate(),
			isDraw: chess.isDraw(),
			isGameOver: chess.isGameOver(),
			isStalemate: chess.isStalemate(),
			isThreefoldRepetition: chess.isThreefoldRepetition(),
			isInsufficientMaterial: chess.isInsufficientMaterial(),
		},

		material: calculateMaterial(chess),

		whitesCapturedPieces,
		blacksCapturedPieces,
	};
};

export const convertGameToGameState = (
	game: DbGameState,
	chess: Chess
): GameState => {
	const gameState: GameState = {
		gameId: game.id,

		...getDynamicGameState(chess),

		whitePlayerId: game.whitePlayerId,
		whitePlayerUsername: game.whitePlayerUsername,

		blackPlayerId: game.blackPlayerId,
		blackPlayerUsername: game.blackPlayerUsername,

		winner: (game.winner ?? "") as GameState["winner"],
		resignedBy: (game.resignedBy ?? "") as GameState["resignedBy"],
		result: (game.result ?? "") as GameState["result"],
	};

	return gameState;
};

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

	game.status = getGameStatus(chess, game.result);

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