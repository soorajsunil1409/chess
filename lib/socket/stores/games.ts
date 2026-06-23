import { Chess } from "chess.js";

export type Game = {
	gameId: string;
	whitePlayerId: string;
	whitePlayerUsername: string;
	blackPlayerId: string;
	blackPlayerUsername: string;
	status: "waiting" | "active" | "finished";
};

export type GameState = {
	fen: string;
	whitePlayerId: string;
	blackPlayerId: string;
	whitePlayerUsername: string;
	blackPlayerUsername: string;
}

export const games = new Map<string, Game>();

export const chessGames = new Map<string, Chess>();