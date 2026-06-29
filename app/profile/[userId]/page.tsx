import { getUserfromUserId } from "@/lib/api/getUser";
import ProfilePageWidget from "../ProfilePageWidget";
import { getGamesFromUserId } from "@/lib/api/getGames";

const ProfilePage = async ({ params }: {
	params: Promise<{
		userId: string
	}>
}) => {
	const { userId } = await params;

	const user = await getUserfromUserId(userId);

	if (!user) return <div>User not found</div>;

	const games = await getGamesFromUserId(userId);

	if (!games) return <div>User not found</div>;

	return (
		<ProfilePageWidget user={user} games={games} />
	)
}

export default ProfilePage