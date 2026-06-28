import { Chess } from "chess.js";
import { chessGames, games, GameState } from "../stores/games";
import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { convertGameToGameState } from "@/lib/chess";

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
