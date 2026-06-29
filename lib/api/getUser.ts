import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, like } from "drizzle-orm";

export type TUser = {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
}

export const getUserfromUserId: (userId: string) => Promise<TUser | null> = async (userId: string) => {
	const user = await db.select().from(users).where(
		eq(users.id, userId)
	).limit(1);

	if (user.length < 1) return null;

	return user[0];
}
export const getUsersFromSearchString: (searchString: string) => Promise<TUser[] | null> = async (searchString: string) => {
	const fetchedUsers = await db.select().from(users).where(
		like(users.username, `%${searchString}%`)
	)

	return fetchedUsers;
}