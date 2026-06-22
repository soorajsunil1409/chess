import { OnlinePlayer } from "@/lib/socket/stores/onlineUsers";
import { create } from "zustand";

interface OnlineStore {
	players: OnlinePlayer[];
	setPlayers: (players: OnlinePlayer[]) => void;
}

export const useOnlineStore = create<OnlineStore>(
	(set) => ({
		players: [],
		setPlayers: (players) =>
			set({ players }),
	})
);