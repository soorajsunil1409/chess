import { socket } from "@/lib/socket/socket";
import { Challenge } from "@/lib/socket/stores/challenges";
import { Friend } from "@/lib/socket/stores/friends";
import { useChallengeStore } from "@/store/challengeStore";

type LobbyOnlineFriendsWidgetProps = {
	onlineFriends: Friend[];
}

const LobbyOnlineFriendsWidget = ({
	onlineFriends
}: LobbyOnlineFriendsWidgetProps) => {
	const challenges = useChallengeStore((state) => state.challenges);

	// TODO move these socket emits to a separate file
	const sendChallenge = (targetUserId: string) => {
		socket.emit("challenge:send", { targetUserId });
	}

	const acceptChallenge = (challenge: Challenge) => {
		socket.emit("challenge:accept", challenge.challengeId);
	};

	const declineChallenge = (challenge: Challenge) => {
		socket.emit("challenge:decline", challenge.challengeId);
	};

	return (
		<div className="flex flex-1 flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">
			<div className="flex items-center justify-between">

				<div className="flex flex-col gap-1">
					<h2 className="text-xl font-semibold">
						Online Friends
					</h2>
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
							No friends online
						</div>

						<div className="text-zinc-500">
							Check back in a few minutes.
						</div>

					</div>

				)}

				{onlineFriends.map((player) => {
					const incomingChallenge = challenges.find((challenge) => challenge.fromUserId === player.user.id);

					return (
						<div
							key={player.user.id}
							className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#111111] p-4 transition hover:border-zinc-600"
						>

							<div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 w-full">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold">
										{player.user.username[0].toUpperCase()}
									</div>

									<div className="flex flex-col gap-1">
										<div className="font-semibold">{player.user.username}</div>

										<div className="flex items-center gap-2 text-sm text-green-400">
											<div className="h-2 w-2 rounded-full bg-green-500" />
											Online
										</div>
									</div>
								</div>

								{incomingChallenge ? (
									<div className="flex items-center gap-2">
										<button
											onClick={() => acceptChallenge(incomingChallenge)}
											className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
										>
											Accept
										</button>

										<button
											onClick={() => declineChallenge(incomingChallenge)}
											className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
										>
											Reject
										</button>
									</div>
								) : (
									<button
										onClick={() => sendChallenge(player.user.id)}
										className="rounded-lg bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200"
									>
										Challenge
									</button>
								)}
							</div>

						</div>

					)
				})}

			</div>
		</div>
	)
}
export default LobbyOnlineFriendsWidget