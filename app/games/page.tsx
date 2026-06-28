"use client"

import RecentGamesWidget from "@/components/RecentGamesWidget";
import { useGamesStore } from "@/store/gamesStore";

const GamesPage = () => {
	const games = useGamesStore((state) => state.games);

	return (
		<RecentGamesWidget games={games} />
	);
}

export default GamesPage