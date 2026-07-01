import { db } from "@/db";
import { friendRequests } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

export type FriendRequest = {
	id: string;
	fromUserId: string;
	fromUsername: string;
	toUserId: string;
	toUsername: string;
	status: "pending" | "accepted" | "declined";
	createdAt: Date;
	updatedAt: Date;
};

export class FriendsStore {
	public friendRequests = new Map<
		string,
		Map<string, FriendRequest>
	>();

	async init() {
		const requests = await db.query.friendRequests.findMany({
			where: (friendRequests, { eq }) =>
				eq(friendRequests.status, "pending"),
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
				status: request.status,
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

			if (
				this.getPendingRequest(fromId, toId) ||
				this.getPendingRequest(toId, fromId)
			) {
				return null;
			}

			const existing = await db.query.friendRequests.findFirst({
				where: (fr, { or, eq, and }) =>
					or(
						and(
							eq(fr.fromUserId, fromId),
							eq(fr.toUserId, toId)
						),
						and(
							eq(fr.fromUserId, toId),
							eq(fr.toUserId, fromId)
						)
					),
				with: {
					fromUser: {
						columns: {
							username: true,
						},
					},
					toUser: {
						columns: {
							username: true,
						},
					},
				},
			});

			if (existing) {
				if (existing.status === "pending") {
					return null;
				}

				if (existing.status === "accepted") {
					return null;
				}

				// existing.status === "declined"
				await db
					.update(friendRequests)
					.set({
						status: "pending",
						updatedAt: new Date(),
					})
					.where(eq(friendRequests.id, existing.id));

				const request: FriendRequest = {
					id: existing.id,
					fromUserId: existing.fromUserId,
					fromUsername: existing.fromUser.username,
					toUserId: existing.toUserId,
					toUsername: existing.toUser.username,
					status: "pending",
					createdAt: existing.createdAt,
					updatedAt: new Date(),
				};

				this.addRequest(request);

				return request;
			}

			const [fromUser, toUser] = await Promise.all([
				db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, fromId),
					columns: {
						username: true,
					},
				}),
				db.query.users.findFirst({
					where: (users, { eq }) => eq(users.id, toId),
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
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await db.insert(friendRequests).values(request);

			this.addRequest(request);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async acceptRequest(fromId: string, toId: string) {
		try {
			await db
				.update(friendRequests)
				.set({
					status: "accepted",
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(friendRequests.fromUserId, fromId),
						eq(friendRequests.toUserId, toId)
					)
				);

			this.removeRequest(fromId, toId);

			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	async rejectRequest(requestId: string) {
		try {
			const request = await db.query.friendRequests.findFirst({
				where: (fr, { eq }) => {
					eq(fr.id, requestId);
				}
			});

			if (!request) return null;

			await db
				.update(friendRequests)
				.set({
					status: "declined",
					updatedAt: new Date(),
				})
				.where(eq(friendRequests.id, requestId));

			this.removeRequest(request.fromUserId, request.toUserId);

			return request;
		} catch (err) {
			console.error(err);
			return null;
		}
	}
}