import { Chess, Color, PieceSymbol, Square } from "chess.js";

export type LastMove = {
	from: Square,
	to: Square,
	piece: PieceSymbol,
	color: Color,
	captured: PieceSymbol | undefined,
	san: string,
}

export interface Game {
	gameId: string;

	whitePlayerId: string;
	whitePlayerUsername: string;

	blackPlayerId: string;
	blackPlayerUsername: string;

	status: "waiting" | "active" | "finished";

	lastMove: LastMove | null;
}

export type GameState = {
	fen: string;

	lastMove: LastMove | null;

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

	whitePlayerId: string;
	whitePlayerUsername: string;
	blackPlayerId: string;
	blackPlayerUsername: string;
};

export const games = new Map<string, Game>();

export const chessGames = new Map<string, Chess>();