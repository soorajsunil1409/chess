import { Challenge } from "@/store/challengeStore";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerChallengeHandlers } from "./handlers/challengeHandler";
import { onlineUsers } from "./stores/onlineUsers";
import { challenges } from "./stores/challenges";

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	}
})

const emitChallengesForUser = (
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

	console.log("Updating challenges for " + user.username);

	io.to(user.socketId).emit(
		"challenges:update",
		userChallenges
	);
};

io.on("connection", (socket) => {
	const { userId, username } = socket.handshake.auth;

	if (!userId) {
		socket.disconnect();
		return;
	}

	onlineUsers.set(userId, {
		userId,
		username,
		socketId: socket.id
	});

	io.emit("players:online", [...onlineUsers.values()]);

	emitChallengesForUser(userId);

	registerChallengeHandlers(
		io,
		socket,
		userId
	)

	socket.on("disconnect", () => {
		const user = onlineUsers.get(userId);

		if (
			user &&
			user.socketId === socket.id
		) {
			onlineUsers.delete(userId);
		}

		// for (const [
		// 	challengeId,
		// 	challenge,
		// ] of challenges.entries()) {
		// 	if (
		// 		challenge.fromUserId ===
		// 		userId ||
		// 		challenge.toUserId === userId
		// 	) {
		// 		challenges.delete(
		// 			challengeId
		// 		);
		// 	}
		// }

		io.emit(
			"players:online",
			[...onlineUsers.values()]
		);
	});
});

setInterval(() => {
	const now = Date.now();

	for (const [
		challengeId,
		challenge,
	] of challenges.entries()) {
		if (
			now -
			challenge.createdAt >
			60_000
		) {
			challenges.delete(
				challengeId
			);
		}
	}
}, 10 * 60 * 1000);

httpServer.listen(5001, "0.0.0.0", () => {
	console.log("Socket Server Running at 5001");
});