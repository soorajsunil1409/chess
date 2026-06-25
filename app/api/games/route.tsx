import { auth } from "@/auth";
import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { DbGameState } from "@/lib/socket/stores/games";
import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async () => {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 400 }
		);
	}
	const userId = session.user.id;

	const userGames = await db
		.select()
		.from(gamesTable)
		.where(
			and(
				or(
					eq(gamesTable.whitePlayerId, userId),
					eq(gamesTable.blackPlayerId, userId)
				),
				eq(gamesTable.status, "finished")
			)
		)

	return NextResponse.json(
		{games: userGames},
		{status: 200}
	);
};