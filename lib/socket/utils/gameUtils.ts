import { Chess, Move } from "chess.js";
import { GameState } from "../stores/games";
import { Challenge } from "@/store/challengeStore";

const pieceValues = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
} as const;

export const updateGameState = (game: GameState, chess: Chess, move: Move | null) => {
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
			console.log(move);

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

		game.material = {
			white: whiteMaterial,
			black: blackMaterial,
			advantage: whiteMaterial - blackMaterial,
		};
	}

	game.history = chess.history();

	game.turn = chess.turn();

	game.status = {
		isCheck: chess.isCheck(),
		isCheckMate: chess.isCheckmate(),
		isDraw: chess.isDraw(),
		isGameOver: game.status.isGameOver,
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