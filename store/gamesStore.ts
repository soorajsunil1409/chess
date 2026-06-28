import { DbGameState } from "@/lib/socket/stores/games";
import { create } from "zustand";

interface GamesStore {
	games: DbGameState[];
	setGames: (players: DbGameState[]) => void;
}

export const useGamesStore = create<GamesStore>(
	(set) => ({
		games: [],
		setGames: (games) =>
			set({ games }),
	})
);