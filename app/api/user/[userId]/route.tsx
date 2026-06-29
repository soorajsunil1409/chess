import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
		);
	}

	const user = await db
		.select()
		.from(users)
		.where(
			eq(users.id, userId)
		).limit(1);

	if (user.length === 0) {
		return NextResponse.json(
			{ error: "User does not exist" },
			{ status: 404 }
		);
	}

	return NextResponse.json(
		{user: user[0]},
		{status: 200}
	);
}