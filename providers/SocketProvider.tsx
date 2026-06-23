"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { useOnlineStore } from "@/store/onlineStore";
import { Challenge, useChallengeStore } from "@/store/challengeStore";
import { useRouter } from "next/navigation";

export default function SocketProvider() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const setPlayers = useOnlineStore((state) => state.setPlayers);
	const setChallenges = useChallengeStore((state) => state.setChallenges);

	useEffect(() => {
		const handlePlayers = (players: any[]) => {
			setPlayers(players);
		};

		socket.on("players:online", handlePlayers);

		return () => {
			console.log("Removing listener");
			socket.off("players:online", handlePlayers);
		};
	}, [setPlayers]);

	useEffect(() => {
		if (status !== "authenticated") return;

		socket.auth = {
			userId: session?.user?.id,
			username: session?.user?.name,
		};

		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, [status, session]);

	useEffect(() => {
		const handleUpdateChallenges = (challenges: Challenge[]) => {
			console.log(challenges);
			setChallenges(challenges);
		}

		socket.on("challenges:update", handleUpdateChallenges);

		return () => {
			socket.off("challenges:update", handleUpdateChallenges)
		}
	}, []);

	useEffect(() => {
		const handleGame = ({gameId}: {gameId: string}) => {
			router.push(`/game/${gameId}`);
			// console.log(gameId);
		}

		socket.on("game:start", handleGame);

		return () => {
			socket.off("game:start", handleGame);
		}
	}, [router])

	return null;
}