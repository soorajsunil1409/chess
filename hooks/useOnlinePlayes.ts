import { OnlinePlayer } from "@/lib/server"
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";


export const useOnlinePlayers = () => {
	const [players, setPlayers] = useState<OnlinePlayer[]>([]);

	useEffect(() => {
		socket.on("players:online", (players: OnlinePlayer[]) => {
			setPlayers(players)
		});

		return () => {
			socket.off("players:online");
		};
	}, []);

	return players;
}