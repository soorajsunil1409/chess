import { Server, Socket } from "socket.io";
import { chessGames, games, GameState } from "../stores/games";
import { updateGameState } from "@/lib/chess";
import { updateGameDraw, updateGameMove, updateGameOver, updateGameResignation } from "@/lib/db/dbGameUpdate";
import { onlineUsers } from "../stores/onlineUsers";


const validateGame = (game: GameState | undefined, socket: Socket, userId: string) => {
	if (!game) {
		return {
			success: false,
			message: "Game does not exist"
		};
	}

	if (game.whitePlayerId !== userId &&
		game.blackPlayerId !== userId) {
		return {
			success: false,
			message: "You are not part of this game"
		};
	}

	if (game.result !== "") {
		return {
			success: false,
			message: "Game has already ended"
		};
	}

	if (!game.status) {
		return {
			success: false,
			message: "Game error"
		};
	}

	return {
		success: true
	}
}


export const registerGameHandlers = (
	io: Server, socket: Socket, userId: string
) => {
	socket.on("game:join", async (gameId: string) => {
		let game = games.get(gameId);

		if (!game) {
			socket.emit(
				"game:error",
				"Game not found"
			);
			return;
		}

		const isPlayer = game.whitePlayerId ===
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
	});

	socket.on(
		"game:move",
		async ({
			gameId, from, to, promotion,
		}) => {
			let game = games.get(gameId);

			if (!game) return;

			if (game.result !== "") {
				socket.emit(
					"game:error",
					"Game has ended"
				);
				return;
			}

			const chess = chessGames.get(gameId);

			if (!chess) return;

			const isPlayer = game.whitePlayerId === userId ||
				game.blackPlayerId === userId;

			if (!isPlayer) return;

			const playerColor = game.whitePlayerId === userId
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
				const move = chess.move({
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

		const { success: gameValidated, message } = validateGame(game, socket, userId);

		if (!gameValidated || !game) {
			socket.emit("game:error", message);
			return;
		}

		const chess = chessGames.get(gameId);

		if (!chess) {
			socket.emit("game:error", "Game error");
			return;
		}

		const resignedColor = game.whitePlayerId === userId
			? "w"
			: "b";

		const winner = resignedColor === "w"
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

	socket.on("game:draw_request", async (gameId: string) => {
		let game = games.get(gameId);

		const { success: gameValidated, message } = validateGame(game, socket, userId);

		if (!gameValidated || !game) {
			socket.emit("game:error", message);
			return;
		}

		// const requestor = game.whitePlayerId === userId ? userId : game.blackPlayerId;
		const receiverId = userId === game.whitePlayerId ? game.blackPlayerId : game.whitePlayerId;
		const receiver = onlineUsers.get(receiverId)

		if (!receiver) {
			socket.emit(
				"game:error",
				"Error sending draw request"
			);
			return;
		}

		io.to(receiver.socketId).emit("game:draw_requested")
	});

	socket.on("game:draw_decline", (gameId: string) => {
		let game = games.get(gameId);

		const { success: gameValidated, message } = validateGame(game, socket, userId);

		if (!gameValidated || !game) {
			socket.emit("game:error", message);
			return;
		}

		const declineeId = userId === game.whitePlayerId ? game.blackPlayerId : game.whitePlayerId;
		const declinee = onlineUsers.get(declineeId);

		if (!declinee) {
			socket.emit("game:error", "Error declining draw");
			return;
		}

		io.to(declinee.socketId).emit("game:draw_declined");
	});

	socket.on("game:draw_accept", async (gameId: string) => {
		let game = games.get(gameId);

		const { success: gameValidated, message } = validateGame(game, socket, userId);

		if (!gameValidated || !game) {
			socket.emit("game:error", message);
			return;
		}

		const accepteeId = userId === game.whitePlayerId ? game.blackPlayerId : game.whitePlayerId;
		const acceptee = onlineUsers.get(accepteeId);

		if (!acceptee) {
			socket.emit("game:error", "Error declining draw");
			return;
		}

		io.to(acceptee.socketId).emit("game:draw_accepted");

		const chess = chessGames.get(gameId);

		if (!chess) {
			socket.emit("game:error", "Game error");
			return;
		}

		game.winner = "draw";

		game.result = "draw";

		game.status.isGameOver = true;

		io.to(gameId).emit("game:update", game);

		const { success, error } = await updateGameDraw(gameId, chess);

		if (!success) {
			socket.emit(
				"game:error",
				error
			);

			return;
		}
	});
}