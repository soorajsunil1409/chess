import { Server, Socket } from "socket.io";
import { updateGameState } from "@/lib/chess";
import { updateGameMove, updateGameOver } from "@/lib/db/dbGameUpdate";
import { onlineUsers } from "../stores/onlineUsers";
import { gamesStore } from "../server";

export const registerGameHandlers = (
	io: Server, socket: Socket, userId: string
) => {
	// TODO update challenge handler too
	socket.on("game:join", (gameId: string) => {
		const res = gamesStore.joinGame(gameId, userId);

		console.log(res);

		if (!res.success) {
			return;
		}


		socket.join(gameId);

		const game = updateGameState(res.game, res.chess, null);

		socket.emit("game:state", game);
	});

	socket.on(
		"game:move",
		async ({
			gameId, from, to, promotion,
		}, callback) => {
			const response = gamesStore.move(gameId, from, to, promotion, userId);

			if (!response.success) {
				callback({
					success: false,
					error: response.error
				});
				return;
			}

			const game = response.game;

			if (response.chess.isGameOver() && game.winner && game.result) {
				await updateGameOver(game.gameId, game.result, game.winner, socket);
			}

			const { success, error } = await updateGameMove(game, response.chess, socket);

			if (!success) {
				callback({
					success: false,
					error: error
				});
				return;
			}
			
			io.to(gameId).emit("game:update", game);

			callback({
				success: true,
			});
		}
	);

	socket.on("game:resign", async (gameId: string) => {
		const response = await gamesStore.resign(gameId, userId);

		if (!response.success) {
			// callback
			return;
		}

		const game = response.game;

		io.to(gameId).emit("game:update", game);
	});

	socket.on("game:draw_request", (gameId: string) => {
		const response = gamesStore.getOpponentId(gameId, userId);

		if (!response.success) {
			// callback
			return;
		};

		const receiver = onlineUsers.get(response.opponentId);

		if (!receiver) return;

		io.to(receiver.socketId).emit("game:draw_requested");
	});

	socket.on("game:draw_decline", (gameId: string) => {
		const response = gamesStore.getOpponentId(gameId, userId);

		if (!response.success) {
			// callback
			return;
		};

		const declinee = onlineUsers.get(response.opponentId);

		if (!declinee) return;

		io.to(declinee.socketId).emit("game:draw_declined");
	});

	socket.on("game:draw_accept", async (gameId: string) => {
		const response = await gamesStore.acceptDraw(gameId, userId);

		if (!response.success) {
			// callback
			return;
		}

		const { opponentId, game } = response;
		if (opponentId) {
			const acceptee = onlineUsers.get(opponentId);

			if (acceptee) {
				io.to(acceptee.socketId).emit("game:draw_accepted");
			}
		}

		io.to(gameId).emit("game:update", game);
	});
}