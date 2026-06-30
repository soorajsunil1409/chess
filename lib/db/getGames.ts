import { db } from "@/db";
import { DbGameState } from "../socket/stores/games";
import { gamesTable } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

export const getGamesFromUserId: (userId: string) => Promise<DbGameState[] | []> = async (userId: string) => {
	const fetchedGames = await db.select().from(gamesTable).where(
		and(
			or(
				eq(gamesTable.whitePlayerId, userId),
				eq(gamesTable.blackPlayerId, userId)
			),
			eq(gamesTable.status, "finished")
		)
	)

	return fetchedGames;
}

export const getGameFromGameId: (gameId: string) => Promise<DbGameState | null> = async (gameId: string) => {
	const game = await db.select().from(gamesTable).where(
		eq(gamesTable.id, gameId)
	).limit(1);

	if (game.length < 1) return null;

	return game[0];
}