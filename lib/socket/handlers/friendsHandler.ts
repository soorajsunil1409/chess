import { Server, Socket } from "socket.io";
import { friendsStore } from "../server";
import { emitFriendRequests } from "../utils/emitChanges";

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
			callback({
				success: false,
				error: "Request already exists",
			});
			return;
		}

		emitFriendRequests(io, targetUserId);

        callback({ success: true });
	});
};