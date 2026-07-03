import { Friend } from "@/lib/socket/stores/friends";
import { useFriendsStore } from "@/store/friendsStore";
import { useGamesStore } from "@/store/gamesStore"

type LobbyStatsWidgetProps = {
	friends: Friend[];
	onlineFriends: Friend[];
}


const LobbyStatsWidget = ({
	friends,
	onlineFriends
}: LobbyStatsWidgetProps) => {
	const games = useGamesStore((state) => state.games);

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
				<span className="text-sm text-zinc-500">
					Friends
				</span>

				<span className="text-3xl font-bold">
					{friends.length}
				</span>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
				<span className="text-sm text-zinc-500">
					Friends Online
				</span>

				<span className="text-3xl font-bold">
					{onlineFriends.length}
				</span>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
				<span className="text-sm text-zinc-500">
					Games Played
				</span>

				<span className="text-3xl font-bold">
					{games.length}
				</span>
			</div>
		</div>
	)
}
export default LobbyStatsWidget