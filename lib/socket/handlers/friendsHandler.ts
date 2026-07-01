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

		callback({ success: true });
	});

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

		emitFriendRequests(io, userId);

		const fromUserOnline = onlineUsers.get(request.fromUserId);

		if (!fromUserOnline) return;

		io.to(fromUserOnline.socketId).emit(
			"friend_request:accepted",
			request
		);
	});
};