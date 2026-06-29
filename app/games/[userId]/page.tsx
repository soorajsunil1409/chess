import RecentGamesWidget from "@/components/RecentGamesWidget";
import { getGamesFromUserId } from "@/lib/api/getGames";

const IndividualGamesPage = async ({ params }: {
	params: Promise<{
		userId: string
	}>
}) => {
	const { userId } = await params;

	const games = await getGamesFromUserId(userId);

	if (!games) {
		return <div>User not found</div>
	}

	return (
		<RecentGamesWidget games={games} />
	);
}

export default IndividualGamesPage