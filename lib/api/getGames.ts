import { DbGameState } from "../socket/stores/games";

export const getGamesFromUserId: (userId: string) => Promise<DbGameState[] | []> = async (userId: string) => {
	const res = await fetch(`${process.env.AUTH_URL}/api/games/${userId}`);

	const data = await res.json();

	const fetchedGames: DbGameState[] | [] = data.games;

	return fetchedGames
}

export const getGameFromGameId: (gameId: string) => Promise<DbGameState | null> = async (gameId: string) => {
	const res = await fetch(`${process.env.AUTH_URL}/api/game/${gameId}`);

	const data = await res.json();

	const game: DbGameState = data.game;

	if (!game) return null;

	return game;
}