"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket/socket";
import { useOnlineStore } from "@/store/onlineStore";
import { useChallengeStore } from "@/store/challengeStore";
import { Challenge } from "@/lib/socket/stores/challenges";
import { useRouter } from "next/navigation";
import { useGamesStore } from "@/store/gamesStore";
import { Friend, FriendRequest } from "@/lib/socket/stores/friends";
import { useFriendRequestStore } from "@/store/friendRequestStore";
import { toast } from "sonner";
import { useFriendsStore } from "@/store/friendsStore";
// import { getGamesFromUserId } from "@/lib/db/getGames";

export default function SocketProvider() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const setPlayers = useOnlineStore((state) => state.setPlayers);
	const setChallenges = useChallengeStore((state) => state.setChallenges);
	const setIncomingFriendRequests = useFriendRequestStore((state) => state.setIncomingFriendRequests);
	const setOutgoingFriendRequests = useFriendRequestStore((state) => state.setOutgoingFriendRequests);
	const addFriend = useFriendsStore((state) => state.addFriend);
	const removeFriend = useFriendsStore((state) => state.removeFriend);
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

	// Handle friend requests / remove friends
	useEffect(() => {
		const handleUpdateFriendRequest = ({ incoming, outgoing }: { incoming: FriendRequest[], outgoing: FriendRequest[] }) => {
			setIncomingFriendRequests(incoming);
			setOutgoingFriendRequests(outgoing);
		}

		const handleAcceptFriendRequest = (friend: Friend) => {
			addFriend(friend);
			toast.success(`${friend.user.username} added as friend.`);
		}
		
		const handleFriendRemoved = ({ userId }: { userId: string }) => {
			removeFriend(userId);
			toast.success(`Removal successful`);
		}

		socket.on("friend_request:update", handleUpdateFriendRequest);
		socket.on("friend_request:accepted", handleAcceptFriendRequest);
		socket.on("friend:removed", handleFriendRemoved);

		return () => {
			socket.off("friend_request:update", handleUpdateFriendRequest);
			socket.off("friend_request:accepted", handleAcceptFriendRequest);
			socket.off("friend:removed", handleFriendRemoved);
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