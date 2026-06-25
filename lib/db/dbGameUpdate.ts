import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { GameState } from "../socket/stores/games";
import { Chess, Color } from "chess.js";
import { eq } from "drizzle-orm";
import { Socket } from "socket.io";


export const updateGameMove = async (game: GameState, chess: Chess, socket: Socket) => {
	try {
		await db.update(gamesTable).set({ fen: chess.fen(), pgn: chess.pgn() }).where(eq(gamesTable.id, game.gameId));
		return {
			success: true,
		}
	} catch (error) {
		console.log(error);
		return {
			success: false,
			error: "Movement Error"
		};
	}
}

export const updateGameOver = async (gameId: string, result: "draw" | "checkmate" | "stalemate" | "resignation", winner: Color | "draw", socket: Socket) => {
	try {
		await db
			.update(gamesTable)
			.set({
				status: "finished",
				result: result,
				winner: winner,
				endedAt: new Date()
			})
			.where(
				eq(
					gamesTable.id, gameId
				)
			);
	} catch (error) {
		console.log(error);

		socket.emit(
			"game:error",
			""
		);
	}
}

export const updateGameResignation = async (
	gameId: string,
	resignedBy: Color,
	winner: Color,
	chess: Chess
) => {
	const resultString = winner === "w" ? "1-0" : "0-1";

	const pgn = chess
		.pgn()
		.replace('[Result "*"]', `[Result "${resultString}"]`)
		.replace(/\*$/, resultString);

	try {
		await db
			.update(gamesTable)
			.set({
				pgn,
				result: "resignation",
				resignedBy,
				winner,
				status: "finished",
				endedAt: new Date(),
			})
			.where(
				eq(
					gamesTable.id,
					gameId
				)
			);

		return {
			success: true,
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: "Failed to update game",
		};
	}
};