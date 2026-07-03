import { Server, Socket } from "socket.io";
import { onlineUsers } from "../stores/onlineUsers";
import { emitChallengesForUser } from "../utils/emitChanges";
import { chessGames, games } from "../stores/games";
import { Chess } from "chess.js";
import { db } from "@/db";
import { gamesTable } from "@/db/schema";
import { initializeGame } from "@/lib/chess";
import { challengeStore } from "../server";


export const registerChallengeHandlers = (
	io: Server, socket: Socket, userId: string
) => {
	socket.on("challenge:send", ({ targetUserId }, callback) => {
		const challenger = onlineUsers.get(userId);
		const target = onlineUsers.get(targetUserId);

		if (!challenger || !target) {
			callback({
				success: false,
				error: "User is offline",
			});
			return;
		}

		if (
			challengeStore.hasChallenge(userId, targetUserId) ||
			challengeStore.hasChallenge(targetUserId, userId)
		) {
			callback({
				success: false,
				error: "Challenge already exists",
			});
			return;
		}

		const challenge = challengeStore.createChallenge({
			fromUserId: userId,
			fromUsername: challenger.username,
			toUserId: targetUserId,
			toUsername: target.username,
		});

		emitChallengesForUser(io, userId);
		emitChallengesForUser(io, targetUserId);

		console.log(
			`${challenge.fromUsername} challenged ${challenge.toUsername}`
		);
		callback({ success: true });
	});

	socket.on("challenge:accept", async ({ challengeId }, callback) => {
		const challenge = challengeStore.acceptChallenge(
			challengeId,
			userId
		);

		if (!challenge) {
			return;
		}

		const challenger = onlineUsers.get(challenge.fromUserId);
		const acceptor = onlineUsers.get(challenge.toUserId);

		if (!challenger || !acceptor) {
			callback({
				success: false,
				error: "Challenge error",
			});
			return;
		}

		emitChallengesForUser(io, challenger.userId);
		emitChallengesForUser(io, acceptor.userId);

		const gameId = crypto.randomUUID();

		const newChess = new Chess();

		chessGames.set(gameId, newChess);

		const game = initializeGame(gameId, newChess, challenge);

		games.set(gameId, game);

		try {
			await db.insert(gamesTable).values({
				id: gameId,

				whitePlayerId: game.whitePlayerId,
				blackPlayerId: game.blackPlayerId,

				whitePlayerUsername: game.whitePlayerUsername,
				blackPlayerUsername: game.blackPlayerUsername,

				fen: newChess.fen(),
				pgn: newChess.pgn(),

				status: "active",
			});
		} catch (error) {
			games.delete(gameId);
			chessGames.delete(gameId);

			callback({
				success: false,
				error: "Game creation failed",
			});

			return;
		}

		io.to(challenger.socketId).emit("game:start", {
			gameId,
		});

		io.to(acceptor.socketId).emit("game:start", {
			gameId,
		});

		callback({ success: true });
	});

	socket.on("challenge:decline", ({ challengeId }, callback) => {
		const challenge = challengeStore.declineChallenge(
			challengeId,
			userId
		);

		if (!challenge) {
			callback({
				success: false,
				error: "Challenge does not exist",
			});
			return;
		}

		const challenger = onlineUsers.get(challenge.fromUserId);

		emitChallengesForUser(io, challenge.fromUserId);
		emitChallengesForUser(io, challenge.toUserId);

		if (challenger) {
			io.to(challenger.socketId).emit(
				"challenge:declined",
				`${challenge.toUsername} declined your challenge`
			);
		}

		callback({ success: true });
	});
}