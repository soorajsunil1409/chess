import { Server } from "socket.io";
import { challenges } from "../stores/challenges";
import { onlineUsers } from "../stores/onlineUsers";
import { friendsStore } from "../server";

export const emitChallengesForUser = (
	io: Server,
	userId: string
) => {
	const user =
		onlineUsers.get(userId);

	if (!user) return;

	const userChallenges =
		[...challenges.values()].filter(
			(challenge) =>
				challenge.toUserId ===
				userId
		);

	io.to(user.socketId).emit(
		"challenges:update",
		userChallenges
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