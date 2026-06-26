import dotenv from "dotenv";
dotenv.config({
	path: ".env.local",
});

import { createServer } from "http";
import { Server } from "socket.io";
import { registerChallengeHandlers } from "./handlers/challengeHandler";
import { onlineUsers } from "./stores/onlineUsers";
import { chessGames, games } from "./stores/games";
import { initializeGames } from "./utils/gameUtils";
import { emitChallengesForUser } from "./utils/emitChanges";
import { updateGameMove, updateGameOver, updateGameResignation } from "../db/dbGameUpdate";
import { updateGameState } from "../chess";

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	}
});

initializeGames()

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

	emitChallengesForUser(io, userId);

	registerChallengeHandlers(
		io,
		socket,
		userId
	)

	socket.on("game:join", async (gameId: string) => {
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
		async ({
			gameId,
			from,
			to,
			promotion,
		}) => {
			let game =
				games.get(gameId);

			if (!game) return;

			if (game.result !== "") {
				socket.emit(
					"game:error",
					"Game has ended"
				);
				return;
			}

			const chess =
				chessGames.get(gameId);

			if (!chess) return;

			const isPlayer =
				game.whitePlayerId === userId ||
				game.blackPlayerId === userId;

			if (!isPlayer) return;

			const playerColor =
				game.whitePlayerId === userId
					? "w"
					: "b";

			if (playerColor !== chess.turn()) {
				socket.emit(
					"game:error",
					"Not your turn"
				);
				return;
			}

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

				if (chess.isGameOver() && game.winner && game.result) {
					await updateGameOver(game.gameId, game.result, game.winner, socket);
				}

				const { success, error } = await updateGameMove(game, chess, socket);

				if (!success) {
					socket.emit(
						"game:error",
						error
					);

					return;
				}
			} catch {
				socket.emit(
					"game:error",
					"Invalid move"
				);
			}
		}
	);

	socket.on("game:resign", async (gameId: string) => {
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

		const chess = chessGames.get(gameId);

		if (!chess) {
			socket.emit("game:error", "Game error");
			return;
		}

		const resignedColor =
			game.whitePlayerId === userId
				? "w"
				: "b";

		const winner =
			resignedColor === "w"
				? "b"
				: "w";

		game.winner = winner;

		game.resignedBy = resignedColor;

		game.result = "resignation";

		game.status.isGameOver = true;

		io.to(gameId).emit("game:update", game);

		const { success, error } = await updateGameResignation(gameId, resignedColor, winner, chess);

		if (!success) {
			socket.emit(
				"game:error",
				error
			);

			return;
		}
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