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
			socket.off("players:online", handlePlayers);
		};
	}, [setPlayers]);

	useEffect(() => {
		if (
			status !== "authenticated" ||
			!session?.user
		)
			return;

		if (!socket.connected) {
			socket.auth = {
				userId: session.user.id,
				username: session.user.name,
			};

			socket.connect();
		}
	}, [status]);

	useEffect(() => {
		if (status === "unauthenticated") {
			socket.disconnect();
		}
	}, [status]);

	useEffect(() => {
		const handleUpdateChallenges = (challenges: Challenge[]) => {
			setChallenges(challenges);
		}

		socket.on("challenges:update", handleUpdateChallenges);

		return () => {
			socket.off("challenges:update", handleUpdateChallenges)
		}
	}, []);

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