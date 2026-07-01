"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket/socket";
import { useOnlineStore } from "@/store/onlineStore";
import { Challenge, useChallengeStore } from "@/store/challengeStore";
import { useRouter } from "next/navigation";
import { useGamesStore } from "@/store/gamesStore";
import { FriendRequest } from "@/lib/socket/stores/friends";
import { useFriendRequestStore } from "@/store/friendRequestStore";
import { toast } from "sonner";
// import { getGamesFromUserId } from "@/lib/db/getGames";

export default function SocketProvider() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const setPlayers = useOnlineStore((state) => state.setPlayers);
	const setChallenges = useChallengeStore((state) => state.setChallenges);
	const setFriendRequests = useFriendRequestStore((state) => state.setFriendRequests);
	// const setGames = useGamesStore((state) => state.setGames);

	// Listener to update online Players
	useEffect(() => {
		const handlePlayers = (players: any[]) => {
			setPlayers(players);
			console.log("players");
		};

		socket.on("players:online", handlePlayers);

		return () => {
			socket.off("players:online", handlePlayers);
		};
	}, [setPlayers]);

	// Handle friend requests
	useEffect(() => {
		const handleUpdateFriendRequest = (friendRequests: FriendRequest[]) => {
			setFriendRequests(friendRequests);
		}

		const handleAcceptFriendRequest = (friendRequest: FriendRequest) => {
			console.log(friendRequest);
			// TODO Update FriendStore
			toast.success(`${friendRequest.toUsername} accepted your friend request.`);
		}

		socket.on("friend_request:update", handleUpdateFriendRequest);
		socket.on("friend_request:accepted", handleAcceptFriendRequest);
		
		return () => {
			socket.off("friend_request:update", handleUpdateFriendRequest);
			socket.off("friend_request:accepted", handleAcceptFriendRequest);
		}
	}, []);

	// On login establish a socket and fetch all the games
	useEffect(() => {
		if (
			status !== "authenticated" ||
			!session?.user
		)
			return;

		// const handleGetGames = async () => {
		// 	if (!session.user?.id) return;
		// 	const games = await getGamesFromUserId(session.user?.id);

		// 	setGames(games);
		// }

		// handleGetGames();

		if (!socket.connected) {
			socket.auth = {
				userId: session.user.id,
				username: session.user.name,
			};

			socket.connect();
		}

	}, [status]);

	// If unauthenticated disconnect the socket
	useEffect(() => {
		if (status === "unauthenticated") {
			socket.disconnect();
		}
	}, [status]);

	// Listener to update incoming challenges
	useEffect(() => {
		const handleUpdateChallenges = (challenges: Challenge[]) => {
			setChallenges(challenges);
		}

		socket.on("challenges:update", handleUpdateChallenges);

		return () => {
			socket.off("challenges:update", handleUpdateChallenges)
		}
	}, []);

	// Listener to check if a game started and redirect to game page
	useEffect(() => {
		const handleGame = ({ gameId }: { gameId: string }) => {
			router.push(`/game/${gameId}`);
		}

		socket.on("game:start", handleGame);

		return () => {
			socket.off("game:start", handleGame);
		}
	}, [router])

	return null;
}