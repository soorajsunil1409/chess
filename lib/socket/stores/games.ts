import { Chess, Color, PieceSymbol, Square } from "chess.js";

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

export const games = new Map<string, GameState>();

export const chessGames = new Map<string, Chess>();