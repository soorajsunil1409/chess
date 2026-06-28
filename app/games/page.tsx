"use client"

import RecentGamesWidget from "@/components/RecentGamesWidget";
import { DbGameState } from "@/lib/socket/stores/games"
import { Chess } from "chess.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

const GamesPage = () => {
	const router = useRouter();
	const [userGames, setUserGames] = useState<DbGameState[]>([]);

	useEffect(() => {
		const getGames = async () => {
			const res = await fetch("/api/games");

			const { games } = await res.json();

			setUserGames(games);

			console.log(games);
		}

		getGames();
	}, []);

	return (
		<RecentGamesWidget games={userGames} />
	);
}

export default GamesPage