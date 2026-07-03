import { Server } from "socket.io";
import { onlineUsers } from "../stores/onlineUsers";
import { challengeStore, friendsStore } from "../server";

export const emitChallengesForUser = (
	io: Server,
	userId: string
) => {
	const user = onlineUsers.get(userId);

	if (!user) {
		return;
	}

	io.to(user.socketId).emit(
		"challenges:update",
		challengeStore.getIncoming(userId)
	);
};

export const emitFriendRequests = (
	io: Server,
	targetUserId: string
) => {
	const toUserOnline = onlineUsers.get(targetUserId);

	if (toUserOnline) {
		io.to(toUserOnline.socketId).emit(
			"friend_request:update",
			{
				incoming: friendsStore.getIncomingRequests(targetUserId),
				outgoing: friendsStore.getOutgoingRequests(targetUserId),
			}
		);
	}
}