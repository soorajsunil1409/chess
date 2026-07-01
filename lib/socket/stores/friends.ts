import { db } from "@/db";
import { friendRequests, friends } from "@/db/schema";
import { eq } from "drizzle-orm";

export type FriendRequest = {
	id: string;
	fromUserId: string;
	fromUsername: string;
	toUserId: string;
	toUsername: string;
	createdAt: Date;
	updatedAt: Date;
};

export type Friend = {
	user: {
		id: string;
		username: string;
	};
	createdAt: string | Date;
};

export class FriendsStore {
	public friendRequests = new Map<
		string,
		Map<string, FriendRequest>
	>();

	async init() {
		const requests = await db.query.friendRequests.findMany({
			with: {
				fromUser: true,
				toUser: true
			}
		})
		for (const request of requests) {
			this.addRequest({
				id: request.id,
				fromUserId: request.fromUserId,
				fromUsername: request.fromUser.username,
				toUserId: request.toUserId,
				toUsername: request.toUser.username,
				createdAt: request.createdAt,
				updatedAt: request.updatedAt,
			});
		}
	}

	private addRequest(request: FriendRequest) {
		let incoming = this.friendRequests.get(request.toUserId);

		if (!incoming) {
			incoming = new Map();
			this.friendRequests.set(request.toUserId, incoming);
		}

		incoming.set(request.fromUserId, request);
	}

	private removeRequest(fromUserId: string, toUserId: string) {
		const incoming = this.friendRequests.get(toUserId);

		if (!incoming) return;

		incoming.delete(fromUserId);

		if (incoming.size === 0) {
			this.friendRequests.delete(toUserId);
		}
	}

	getPendingRequest(fromUserId: string, toUserId: string) {
		return this.friendRequests
			.get(toUserId)
			?.get(fromUserId);
	}

	getIncomingRequests(userId: string) {
		return [
			...(this.friendRequests.get(userId)?.values() ?? []),
		];
	}

	async sendRequest(fromId: string, toId: string) {
		try {
			if (fromId === toId) return null;

			// Already pending (cache)
			if (
				this.getPendingRequest(fromId, toId) ||
				this.getPendingRequest(toId, fromId)
			) {
				return null;
			}

			// Already friends
			const friendship = await db.query.friends.findFirst({
				where: (f, { or, and, eq }) =>
					or(
						and(
							eq(f.user1Id, fromId),
							eq(f.user2Id, toId)
						),
						and(
							eq(f.user1Id, toId),
							eq(f.user2Id, fromId)
						)
					),
			});

			if (friendship) return null;

			const [fromUser, toUser] = await Promise.all([
				db.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, fromId),
					columns: {
						username: true,
					},
				}),
				db.query.users.findFirst({
					where: (u, { eq }) => eq(u.id, toId),
					columns: {
						username: true,
					},
				}),
			]);

			if (!fromUser || !toUser) return null;

			const request: FriendRequest = {
				id: crypto.randomUUID(),
				fromUserId: fromId,
				fromUsername: fromUser.username,
				toUserId: toId,
				toUsername: toUser.username,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await db.insert(friendRequests).values({
				id: request.id,
				fromUserId: request.fromUserId,
				toUserId: request.toUserId,
				createdAt: request.createdAt,
				updatedAt: request.updatedAt,
			});

			this.addRequest(request);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async acceptRequest(requestId: string) {
		try {
			const request = await db.query.friendRequests.findFirst({
				where: (fr, { eq }) =>
					eq(fr.id, requestId),
				with: {
					fromUser: true,
					toUser: true
				}
			});

			if (!request) return null;

			await db
				.delete(friendRequests)
				.where(eq(friendRequests.id, requestId));

			const user1Id =
				request.fromUserId < request.toUserId
					? request.fromUserId
					: request.toUserId;

			const user2Id =
				request.fromUserId < request.toUserId
					? request.toUserId
					: request.fromUserId;

			await db.insert(friends).values({
				user1Id,
				user2Id,
			});

			this.removeRequest(request.fromUserId, request.toUserId);

			return {
				id: request.id,
				createdAt: request.createdAt,
				fromUserId: request.fromUserId,
				toUserId: request.toUserId,
				updatedAt: request.updatedAt,
				fromUsername: request.fromUser.username,
				toUsername: request.toUser.username
			};
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	async rejectRequest(requestId: string) {
		try {
			const request = await db.query.friendRequests.findFirst({
				where: (fr, { eq }) =>
					eq(fr.id, requestId)
			});

			if (!request) return null;

			await db
				.delete(friendRequests)
				.where(eq(friendRequests.id, requestId));

			this.removeRequest(request.fromUserId, request.toUserId);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}
}