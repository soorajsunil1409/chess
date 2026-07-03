import { socket } from "@/lib/socket/socket";
import { Friend } from "@/lib/socket/stores/friends";

type LobbyOnlineFriendsWidgetProps = {
	onlineFriends: Friend[];
}

const LobbyOnlineFriendsWidget = ({
	onlineFriends
}: LobbyOnlineFriendsWidgetProps) => {
	const sendChallenge = (targetUserId: string) => {
		socket.emit("challenge:send", { targetUserId });
	}

	return (
		<div className="flex flex-1 flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">
			<div className="flex items-center justify-between">

				<div className="flex flex-col gap-1">
					<h2 className="text-xl font-semibold">
						Online Players
					</h2>

					<span className="text-sm text-zinc-500">
						Challenge anyone currently online.
					</span>
				</div>

				<div className="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
					{onlineFriends.length} Online
				</div>

			</div>

			<input
				type="text"
				placeholder="Search players..."
				className="rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-zinc-500"
			/>
			<div className="flex flex-col grow-0 gap-3">

				{onlineFriends.length === 0 && (

					<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 py-16">

						<div className="text-lg font-semibold">
							No players online
						</div>

						<div className="text-zinc-500">
							Check back in a few minutes.
						</div>

					</div>

				)}

				{onlineFriends.map((player) => (

					<div
						key={player.user.id}
						className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#111111] p-4 transition hover:border-zinc-600"
					>

						<div className="flex items-center gap-4">

							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold">
								{player.user.username[0].toUpperCase()}
							</div>

							<div className="flex flex-col gap-1">

								<div className="font-semibold">
									{player.user.username}
								</div>

								<div className="flex items-center gap-2 text-sm text-green-400">

									<div className="h-2 w-2 rounded-full bg-green-500" />

									Online

								</div>

							</div>

						</div>

						<button
							onClick={() => sendChallenge(player.user.id)}
							className="rounded-lg bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200"
						>
							Challenge
						</button>

					</div>

				))}

			</div>
		</div>
	)
}
export default LobbyOnlineFriendsWidget