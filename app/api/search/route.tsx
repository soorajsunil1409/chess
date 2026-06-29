import { db } from "@/db";
import { users } from "@/db/schema";
import { like } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
	const searchParams = request.nextUrl.searchParams;

	const query = searchParams.get("q");

	const fetchedUsers = await db.select().from(users).where(
		like(users.username, `%${query}%`)
	)

	if (fetchedUsers.length === 0 || !fetchedUsers) {
		return NextResponse.json({
			users: [],
		}, {
			status: 404
		});
	}

	return NextResponse.json({
		users: fetchedUsers
	}, {
		status: 200
	});
};