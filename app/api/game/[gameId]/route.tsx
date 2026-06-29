import { auth } from "@/auth";
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
			gameId: string;
		}>
	}
) => {
	const { gameId } = await params;

	if (!gameId) {
		return NextResponse.json(
			{ error: "Game does not exist" },
			{ status: 404 }
		);
	}

	const game = await db.select().from(gamesTable).where(
		eq(gamesTable.id, gameId)
	).limit(1);

	if (game.length === 0) {
		return NextResponse.json(
			{ error: "Game does not exist" },
			{ status: 404 }
		);
	}

	return NextResponse.json(
		{ game: game[0] },
		{ status: 200 }
	);
};