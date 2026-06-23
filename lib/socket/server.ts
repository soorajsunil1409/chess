import { Challenge } from "@/store/challengeStore";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerChallengeHandlers } from "./handlers/challengeHandler";
import { onlineUsers } from "./stores/onlineUsers";
import { challenges } from "./stores/challenges";
import { chessGames, games } from "./stores/games";

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
		const game = games.get(gameId);

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

		socket.emit("game:state", {
			fen: chess.fen(),

			lastMove: game.lastMove,

			turn: chess.turn(),

			status: {
				isCheck: chess.isCheck(),
				isCheckMate: chess.isCheckmate(),
				isDraw: chess.isDraw(),
				isGameOver: chess.isGameOver(),
				isStalemate: chess.isStalemate(),
				isThreefoldRepetition:
					chess.isThreefoldRepetition(),
				isInsufficientMaterial:
					chess.isInsufficientMaterial(),
			},

			whitePlayerId: game.whitePlayerId,
			whitePlayerUsername:
				game.whitePlayerUsername,

			blackPlayerId: game.blackPlayerId,
			blackPlayerUsername:
				game.blackPlayerUsername,
		});
	})

	socket.on(
		"game:move",
		({
			gameId,
			from,
			to,
			promotion,
		}) => {
			const game =
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

				game.lastMove = {
					from: move.from,
					to: move.to,
					piece: move.piece,
					color: move.color,
					captured: move.captured,
					san: move.san,
				};

				io.to(gameId).emit("game:update", {
					fen: chess.fen(),

					lastMove: game.lastMove,

					turn: chess.turn(),

					status: {
						isCheck: chess.isCheck(),
						isCheckMate: chess.isCheckmate(),
						isDraw: chess.isDraw(),
						isGameOver: chess.isGameOver(),
						isStalemate: chess.isStalemate(),
						isThreefoldRepetition:
							chess.isThreefoldRepetition(),
						isInsufficientMaterial:
							chess.isInsufficientMaterial(),
					},

					players: {
						white: {
							id: game.whitePlayerId,
							username:
								game.whitePlayerUsername,
						},
						black: {
							id: game.blackPlayerId,
							username:
								game.blackPlayerUsername,
						},
					},
				});
			} catch {
				socket.emit(
					"game:error",
					"Invalid move"
				);
			}
		}
	);

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

// setInterval(() => {
// 	const now = Date.now();

// 	for (const [
// 		challengeId,
// 		challenge,
// 	] of challenges.entries()) {
// 		if (
// 			now -
// 			challenge.createdAt >
// 			60_000
// 		) {
// 			challenges.delete(
// 				challengeId
// 			);
// 		}
// 	}
// }, 10 * 60 * 1000);

httpServer.listen(5001, "0.0.0.0", () => {
	console.log("Socket Server Running at 5001");
});