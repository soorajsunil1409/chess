import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true,
	}
})

export type OnlinePlayer = {
	userId: string;
	username: string;
	socketId: string;
}

const onlineUsers = new Map<string, OnlinePlayer>();

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

	socket.on("disconnect", () => {
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

httpServer.listen(5001, () => {
	console.log("Socket Server Running at 5001");
});