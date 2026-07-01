import { db } from "@/db";
import { friendRequests } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

export type FriendRequest = {
	id: string;
	fromUserId: string;
	toUserId: string;
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
		const requests = await db
			.select()
			.from(friendRequests)
			.where(eq(friendRequests.status, "pending"));

		for (const request of requests) {
			this.addRequest(request);
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

			const existing = await db
				.select()
				.from(friendRequests)
				.where(
					or(
						and(
							eq(friendRequests.fromUserId, fromId),
							eq(friendRequests.toUserId, toId)
						),
						and(
							eq(friendRequests.fromUserId, toId),
							eq(friendRequests.toUserId, fromId)
						)
					)
				)
				.limit(1);

			if (existing.length > 0) return null;

			const request: FriendRequest = {
				id: crypto.randomUUID(),
				fromUserId: fromId,
				toUserId: toId,
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

	async rejectRequest(fromId: string, toId: string) {
		try {
			await db
				.update(friendRequests)
				.set({
					status: "declined",
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
}