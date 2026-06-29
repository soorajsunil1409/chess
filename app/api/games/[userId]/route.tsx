import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
	request: Request,
	{
		params
	}: {
		params: Promise<{
			userId: string;
		}>
	}
) => {
	const { userId } = await params;

	if (!userId) {
		return NextResponse.json(
			{ error: "User does not exist" },
			{ status: 404 }
		)
	}

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
		{ games: userGames },
		{ status: 200 }
	);
};