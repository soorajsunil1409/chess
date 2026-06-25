import { Challenge } from "@/store/challengeStore";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerChallengeHandlers } from "./handlers/challengeHandler";
import { onlineUsers } from "./stores/onlineUsers";
import { challenges } from "./stores/challenges";
import { chessGames, games } from "./stores/games";
import { updateGameState } from "./utils/gameUtils";

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	}
});

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

	socket.on("game:join", (gameId: string) => {
		let game = games.get(gameId);

		if (!game) {
			socket.emit(
				"game:error",
				"Game not found"
			);
			return;
		}

		const isPlayer =
			game.whitePlayerId ===
			userId ||
			game.blackPlayerId ===
			userId;

		if (!isPlayer) {
			socket.emit(
				"game:error",
				"Unauthorized"
			);
			return;
		}

		socket.join(gameId);

		const chess = chessGames.get(gameId);

		if (!chess) {
			socket.emit("game:error", "Game not found");
			return;
		}

		game = updateGameState(game, chess, null);

		socket.emit("game:state", game);
	})

	socket.on(
		"game:move",
		({
			gameId,
			from,
			to,
			promotion,
		}) => {
			let game =
				games.get(gameId);

			if (!game) return;

			const chess =
				chessGames.get(gameId);


			if (!chess) return;

			const isPlayer =
				game.whitePlayerId === userId ||
				game.blackPlayerId === userId;

			if (!isPlayer) return;

			try {
				const move =
					chess.move({
						from,
						to,
						promotion,
					});

				if (!move) {
					socket.emit(
						"game:error",
						"Invalid move"
					);
					return;
				}

				game = updateGameState(game, chess, move);

				io.to(gameId).emit("game:update", game);
			} catch {
				socket.emit(
					"game:error",
					"Invalid move"
				);
			}
		}
	);

	socket.on("game:resign", (gameId: string) => {
		let game = games.get(gameId);

		if (!game) {
			socket.emit("game:error", "Game does not exist");
			return;
		}

		if (
			game.whitePlayerId !== userId &&
			game.blackPlayerId !== userId
		) {
			socket.emit(
				"game:error",
				"You are not part of this game"
			);
			return;
		}

		if (game.result !== "") {
			socket.emit(
				"game:error",
				"Game has already ended"
			);
			return;
		}

		if (!game.status) {
			socket.emit("game:error", "Game error");
			return;
		}

		const resignedColor =
			game.whitePlayerId === userId
				? "w"
				: "b";

		game.winner =
			resignedColor === "w"
				? "b"
				: "w";
		
		game.resignedBy = resignedColor;

		game.result = "resignation";

		game.status.isGameOver = true;

		io.to(gameId).emit("game:update", game);
	});

	socket.on("disconnect", (reason) => {
		const user = onlineUsers.get(userId);

		if (
			user &&
			user.socketId === socket.id
		) {
			onlineUsers.delete(userId);
		}

		// socket._cleanup();

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

httpServer.listen(5001, "0.0.0.0", () => {
	console.log("Socket Server Running at 5001");
});