import { useOnlineStore } from "@/store/onlineStore";
import { useSession } from "next-auth/react";
import LobbyHeader from "./LobbyHeader";
import LobbyStatsWidget from "./LobbyStatsWidget";
import { useFriendsStore } from "@/store/friendsStore";
import LobbyOnlineFriendsWidget from "./LobbyOnlineFriendsWidget";
import LobbyRightColumnWidget from "./LobbyRightColumnWidget";

export const LobbyPage = () => {
	const { data: session } = useSession();

	const players = useOnlineStore((state) => state.players);
	const friends = useFriendsStore((state) => state.friends);

	const onlineFriends = friends.filter((friend) => {
		const onlineFriend = players.find((player) => player.userId === friend.user.id);

		if (onlineFriend) return onlineFriend;
	})

	if (!session?.user?.id || !session?.user?.name) return <div>Loadin Lobby...</div>

	return (
		<main className="flex flex-col flex-1 w-full justify-start bg-[#090909]">
			
			<div className="flex w-full max-w-7xl flex-col gap-6 p-6 flex-1">

				<LobbyHeader username={session.user.name} />

				<LobbyStatsWidget friends={friends} onlineFriends={onlineFriends} />

				<div className="flex flex-col gap-6 lg:flex-row flex-1">

					<LobbyOnlineFriendsWidget onlineFriends={onlineFriends} />

					<LobbyRightColumnWidget />

				</div>

			</div>

		</main>
	);
}