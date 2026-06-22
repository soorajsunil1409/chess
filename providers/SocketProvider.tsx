"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { useOnlinePlayers } from "@/hooks/useOnlinePlayes";
import { useOnlineStore } from "@/store/onlineStore";
import { OnlinePlayer } from "@/lib/server";

export default function SocketProvider() {
	const { data: session, status } = useSession();

	const setPlayers = useOnlineStore((state) => state.setPlayers)

	useEffect(() => {
		const handlePlayers = (players: any[]) => {
			console.log("Received:", players);
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

		console.log("Connecting");
		console.log("Session changed", session);

		socket.auth = {
			userId: session?.user?.id,
			username: session?.user?.name,
		};

		socket.connect();

		return () => {
			console.log("Disconnecting");
			socket.disconnect();
		};
	}, [status, session]);

	return null;
}