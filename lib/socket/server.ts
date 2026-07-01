import dotenv from "dotenv";
dotenv.config({
	path: ".env.local",
});

import { createServer } from "http";
import { Server } from "socket.io";
import { registerChallengeHandlers } from "./handlers/challengeHandler";
import { onlineUsers } from "./stores/onlineUsers";
import { initializeGames } from "./utils/gameUtils";
import { emitChallengesForUser, emitFriendRequests } from "./utils/emitChanges";
import { registerGameHandlers } from "./handlers/gameHandler";
import { registerFriendsHandlers } from "./handlers/friendsHandler";
import { FriendsStore } from "./stores/friends";

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	}
});

initializeGames()
export const friendsStore = new FriendsStore();
friendsStore.init();

// Fetch all the db Users;

io.on("connection", (socket) => {
	const { userId, username } = socket.handshake.auth;

	console.log(username);

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

	emitChallengesForUser(io, userId);

	emitFriendRequests(io, userId);

	registerChallengeHandlers(io, socket, userId);

	registerGameHandlers(io, socket, userId);

	registerFriendsHandlers(io, socket, userId);

	socket.on("disconnect", (reason) => {
		const user = onlineUsers.get(userId);

		if (
			user &&
			user.socketId === socket.id
		) {
			onlineUsers.delete(userId);
		}

		io.emit(
			"players:online",
			[...onlineUsers.values()]
		);
	});
});

httpServer.listen(5001, "0.0.0.0", () => {
	console.log("Socket Server Running at 5001");
});
