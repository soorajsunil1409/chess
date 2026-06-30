import RecentGamesWidget from "@/components/RecentGamesWidget";
import { getGamesFromUserId } from "@/lib/db/getGames";
import { getUserfromUserId } from "@/lib/db/getUser";

const IndividualGamesPage = async ({ params }: {
	params: Promise<{
		userId: string
	}>
}) => {
	const { userId } = await params;

	const user = await getUserfromUserId(userId);
	const games = await getGamesFromUserId(userId);

	if (!games || !user) {
		return <div>User not found</div>
	}

	return (
		<RecentGamesWidget games={games} username={user.username} />
	);
}

export default IndividualGamesPage