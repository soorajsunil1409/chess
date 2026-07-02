import { Server, Socket } from "socket.io";
import { friendsStore } from "../server";
import { emitFriendRequests } from "../utils/emitChanges";
import { onlineUsers } from "../stores/onlineUsers";

export const registerFriendsHandlers = (
	io: Server,
	socket: Socket,
	userId: string
) => {
	socket.on("friend_request:send", async ({ targetUserId }, callback) => {
		const request = await friendsStore.sendRequest(
			userId,
			targetUserId
		);

		if (!request) {
			console.log(request);
			callback({
				success: false,
				error: "Request already exists",
			});
			return;
		}

		emitFriendRequests(io, targetUserId);
		emitFriendRequests(io, request.fromUserId);

		callback({ success: true });
	});

	socket.on("friend_request:unsend", async ({ requestId }, callback) => {
		const request = await friendsStore.unsendRequest(
			requestId
		)

		if (!request) {
			callback({
				success: false,
				error: "Request deletion failed",
			});
			return;
		}

		emitFriendRequests(io, request.toUserId);
		emitFriendRequests(io, request.fromUserId);

		callback({ success: true })
	})

	socket.on("friend_request:decline", async ({ requestId }, callback) => {
		const request = await friendsStore.rejectRequest(requestId);

		if (!request) {
			callback({
				success: false,
			})
			return;
		}

		callback({
			success: true
		});

		emitFriendRequests(io, request.toUserId);
		emitFriendRequests(io, request.fromUserId);
	});


	socket.on("friend_request:accept", async ({ requestId }, callback) => {
		const request = await friendsStore.acceptRequest(requestId);

		if (!request) {
			callback({
				success: false,
			})
			return;
		}

		callback({
			success: true
		});

		emitFriendRequests(io, request.fromUserId);
		emitFriendRequests(io, request.toUserId);

		const fromUserOnline = onlineUsers.get(request.fromUserId);
		const toUserOnline = onlineUsers.get(request.toUserId);

		if (fromUserOnline) {
			io.to(fromUserOnline.socketId).emit(
				"friend_request:accepted",
				{
					user: {
						id: request.toUserId,
						username: request.toUsername
					},
					createdAt: request.createdAt
				}
			);
		}

		if (toUserOnline) {
			io.to(toUserOnline.socketId).emit(
				"friend_request:accepted",
				{
					user: {
						id: request.fromUserId,
						username: request.fromUsername
					},
					createdAt: request.createdAt
				}
			);
		}
	});

	socket.on("friend:remove", async ({ user1Id, user2Id }, callback) => {
		const friendObject = await friendsStore.removeFriend(user1Id, user2Id);

		if (!friendObject) {
			callback({
				success: false,
				error: "Friend object not found"
			})
			return;
		}

		const user1 = onlineUsers.get(friendObject.user1Id);

		if (user1) {
			io.to(user1.socketId).emit(
				"friend:removed",
				{
					userId: friendObject.user2Id
				}
			);
		}

		const user2 = onlineUsers.get(friendObject.user2Id);

		if (user2) {
			io.to(user2.socketId).emit(
				"friend:removed",
				{
					userId: friendObject.user1Id
				}
			);
		}
	})
};