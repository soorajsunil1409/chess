"use client"

import { Friend } from "@/lib/socket/stores/friends"
import { DbGameState } from "@/lib/socket/stores/games";
import { useFriendsStore } from "@/store/friendsStore";
import { useGamesStore } from "@/store/gamesStore";
import { useEffect } from "react";

type HydrationComponentProps = {
	friends: Friend[];
	games: DbGameState[];
}

const HydrationComponent = ({
	friends,
	games
}: HydrationComponentProps) => {
	const setFriends = useFriendsStore((state) => state.setFriends);
	const setGames = useGamesStore((state) => state.setGames);

	useEffect(() => {
		setFriends(friends);
	}, [friends]);

	useEffect(() => {
		setGames(games);
	}, [games]);

	return <></>
}
export default HydrationComponent