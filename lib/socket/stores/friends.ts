import { db } from "@/db";
import { friendRequests, friends } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

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
	public incomingRequests = new Map<
		string,
		Map<string, FriendRequest>
	>();

	public outgoingRequests = new Map<
		string,
		Map<string, FriendRequest>
	>();

	private requestsById = new Map<string, FriendRequest>();

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
		let incoming = this.incomingRequests.get(request.toUserId);

		if (!incoming) {
			incoming = new Map();
			this.incomingRequests.set(request.toUserId, incoming);
		}

		incoming.set(request.fromUserId, request);

		let outgoing = this.outgoingRequests.get(request.fromUserId);

		if (!outgoing) {
			outgoing = new Map();
			this.outgoingRequests.set(request.fromUserId, outgoing);
		}

		outgoing.set(request.toUserId, request);
		this.requestsById.set(request.id, request);
	}

	private removeRequest(request: FriendRequest) {
		this.requestsById.delete(request.id);

		const incoming = this.incomingRequests.get(request.toUserId);

		if (incoming) {
			incoming.delete(request.fromUserId);

			if (incoming.size === 0) {
				this.incomingRequests.delete(request.toUserId);
			}
		}

		const outgoing = this.outgoingRequests.get(request.fromUserId);

		if (outgoing) {
			outgoing.delete(request.toUserId);

			if (outgoing.size === 0) {
				this.outgoingRequests.delete(request.fromUserId);
			}
		}
	}

	getPendingRequest(fromUserId: string, toUserId: string) {
		return this.incomingRequests
			.get(toUserId)
			?.get(fromUserId);
	}

	getIncomingRequests(userId: string) {
		return [
			...(this.incomingRequests.get(userId)?.values() ?? []),
		];
	}

	getOutgoingRequests(userId: string) {
		return [...(this.outgoingRequests.get(userId)?.values() ?? [])];
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

	async unsendRequest(requestId: string) {
		const request = this.requestsById.get(requestId);

		if (!request) return null;

		await db.delete(friendRequests).where(eq(friendRequests.id, requestId));

		this.removeRequest(request);

		return request;
	}

	async acceptRequest(requestId: string) {
		try {
			const request = this.requestsById.get(requestId);

			if (!request) return null;

			const user1Id =
				request.fromUserId < request.toUserId
					? request.fromUserId
					: request.toUserId;

			const user2Id =
				request.fromUserId < request.toUserId
					? request.toUserId
					: request.fromUserId;

			await db.transaction(async (tx) => {
				await tx.delete(friendRequests).where(eq(friendRequests.id, requestId));
				await tx.insert(friends).values({
					user1Id,
					user2Id,
				});
			})

			this.removeRequest(request);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async rejectRequest(requestId: string) {
		try {
			const request = this.requestsById.get(requestId);

			if (!request) return null;

			await db
				.delete(friendRequests)
				.where(eq(friendRequests.id, requestId));

			this.removeRequest(request);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async removeFriend(user1Id: string, user2Id: string) {
		try {
			const friendQuery = await db.query.friends.findFirst({
				where: (friend, { eq, or, and }) =>
					or(
						and(
							eq(friend.user1Id, user1Id),
							eq(friend.user2Id, user2Id)
						),
						and(
							eq(friend.user1Id, user2Id),
							eq(friend.user2Id, user1Id)
						),
					)
			});

			if (!friendQuery) return null;

			await db.delete(friends).where(
				or(
					and(
						eq(friends.user1Id, user1Id),
						eq(friends.user2Id, user2Id)
					),
					and(
						eq(friends.user1Id, user2Id),
						eq(friends.user2Id, user1Id)
					),
				)
			)

			return friendQuery;
		} catch (err) {
			console.error(err);
			return null;
		}
	}
}