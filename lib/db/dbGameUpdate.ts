import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { GameState } from "../socket/stores/games";
import { Chess } from "chess.js";
import { eq } from "drizzle-orm";
import { Socket } from "socket.io";


export const updateGameMove = async (game: GameState, chess: Chess, socket: Socket) => {
	try {
		await db.update(gamesTable).set({ fen: chess.fen(), pgn: chess.pgn() }).where(eq(gamesTable.id, game.gameId));
		return {
			success: true,
			error: ""
		}
	} catch (error) {
		console.log(error);
		return {
			success: false,
			error: "Movement Error"
		};
	}
}