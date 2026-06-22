import { OnlinePlayer } from "@/lib/server";
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