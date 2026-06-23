import { Server } from "socket.io";
import { challenges } from "../stores/challenges";
import { onlineUsers } from "../stores/onlineUsers";
import { Move } from "chess.js";

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