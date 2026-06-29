import { auth } from "@/auth";
import RecentGamesWidget from "@/components/RecentGamesWidget";
import { getGamesFromUserId } from "@/lib/api/getGames";

const GamesPage = async () => {
	const session = await auth();

	if (!session?.user?.id) {
		return <div>User does not exist</div>
	}

	const games = await getGamesFromUserId(session.user.id);

	return (
		<RecentGamesWidget games={games} username={session.user.name!} />
	);
}

export default GamesPage