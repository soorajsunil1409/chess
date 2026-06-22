import { Server, Socket } from "socket.io";
import { onlineUsers } from "../stores/onlineUsers";
import { emitChallengesForUser } from "../utils/emitChanges";
import { challenges } from "../stores/challenges";


export const registerChallengeHandlers = (
	io: Server, socket: Socket, userId: string
) => {
	socket.on("challenge:send", ({ targetUserId }) => {
		const challenger = onlineUsers.get(userId);
		const target = onlineUsers.get(targetUserId);

		if (!challenger || !target) {
			return;
		}

		const challengeId = crypto.randomUUID();

		const challengeObject = {
			challengeId: challengeId,
			fromUserId: userId,
			fromUsername: challenger.username,
			toUserId: targetUserId,
			toUsername: challenger.username,
			createdAt: Date.now()
		}

		challenges.set(
			challengeId,
			challengeObject
		);

		emitChallengesForUser(io, target.userId);

		console.log(
			`${challenger.username} challenged ${target.username}`
		);
	});

	socket.on("challenge:accept", (challengeId: string) => {
		const challenge =
			challenges.get(
				challengeId
			);

		if (!challenge)
			return;

		if (
			challenge.toUserId !==
			userId
		)
			return;

		const challenger =
			onlineUsers.get(
				challenge.fromUserId
			);

		const acceptor =
			onlineUsers.get(
				challenge.toUserId
			);

		if (
			!challenger ||
			!acceptor
		)
			return;

		challenges.delete(
			challengeId
		);

		emitChallengesForUser(io, acceptor.userId);

		const gameId =
			crypto.randomUUID();

		io.to(
			challenger.socketId
		).emit(
			"game:start",
			{
				gameId,
			}
		);

		io.to(
			acceptor.socketId
		).emit(
			"game:start",
			{
				gameId,
			}
		);
	});

	socket.on(
		"challenge:decline",
		(challengeId: string) => {
			const challenge =
				challenges.get(
					challengeId
				);

			if (!challenge)
				return;

			if (
				challenge.toUserId !==
				userId
			)
				return;

			const challenger =
				onlineUsers.get(
					challenge.fromUserId
				);

			challenges.delete(
				challengeId
			);

			emitChallengesForUser(io, challenge.toUserId);

			if (challenger) {
				io.to(
					challenger.socketId
				).emit(
					"challenge:declined",
					{
						challengeId,
					}
				);
			}
		}
	);
}