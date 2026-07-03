import { db } from "@/db"

export const getFriendsOfUserId = async (userId: string) => {
	const fetchedFriends = await db.query.friends.findMany({
		where: (friend, { eq, or }) =>
			or(
				eq(friend.user1Id, userId),
				eq(friend.user2Id, userId)
			),
		with: {
			user1: true,
			user2: true
		}
	})

	if (fetchedFriends.length === 0) return [];

	const friends = fetchedFriends.map((fr) => {
		let user;

		if (fr.user1.id === userId)
			user = fr.user2;
		else
			user = fr.user1;

		return {
			user: {
				id: user.id,
				username: user.username,
				createdAt: user.createdAt
			},
			createdAt: fr.createdAt
		}
	});

	return friends;
}