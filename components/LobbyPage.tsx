import { socket } from "@/lib/socket/socket";
import { useOnlineStore } from "@/store/onlineStore";
import { useSession } from "next-auth/react";

export const LobbyPage = () => {
	const { data: session, status } = useSession();
	const players = useOnlineStore((state) => state.players);

	const onlinePlayers = players.filter((player) => player.userId !== session?.user?.id);

	const sendChallenge = (targetUserId: string) => {
		socket.emit("challenge:send", { targetUserId });
	}

	return (
		<main className="flex flex-col flex-1 w-full justify-start bg-[#090909]">
			<div className="flex w-full max-w-7xl flex-col gap-6 p-6 flex-1">

				{/* Header */}

				<div className="flex flex-col gap-2">
					<h1 className="text-4xl font-bold">
						Welcome back, {session?.user?.name}
					</h1>

					<p className="text-zinc-400">
						Challenge another player or continue one of your active games.
					</p>
				</div>

				{/* Stats */}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
						<span className="text-sm text-zinc-500">
							Online Players
						</span>

						<span className="text-3xl font-bold">
							{onlinePlayers.length}
						</span>
					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
						<span className="text-sm text-zinc-500">
							Active Games
						</span>

						<span className="text-3xl font-bold">
							0 TODO
						</span>
					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
						<span className="text-sm text-zinc-500">
							Friends Online
						</span>

						<span className="text-3xl font-bold">
							0 TODO
						</span>
					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">
						<span className="text-sm text-zinc-500">
							Games Played
						</span>

						<span className="text-3xl font-bold">
							0 TODO
						</span>
					</div>

				</div>

				{/* Main */}

				<div className="flex flex-col gap-6 lg:flex-row flex-1">

					{/* Online Players */}

					<section className="flex flex-1 flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">

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
								{onlinePlayers.length} Online
							</div>

						</div>

						<input
							type="text"
							placeholder="Search players..."
							className="rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-zinc-500"
						/>

						<div className="flex flex-col grow-0 gap-3">

							{onlinePlayers.length === 0 && (

								<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 py-16">

									<div className="text-lg font-semibold">
										No players online
									</div>

									<div className="text-zinc-500">
										Check back in a few minutes.
									</div>

								</div>

							)}

							{onlinePlayers.map((player) => (

								<div
									key={player.userId}
									className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#111111] p-4 transition hover:border-zinc-600"
								>

									<div className="flex items-center gap-4">

										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold">
											{player.username[0].toUpperCase()}
										</div>

										<div className="flex flex-col gap-1">

											<div className="font-semibold">
												{player.username}
											</div>

											<div className="flex items-center gap-2 text-sm text-green-400">

												<div className="h-2 w-2 rounded-full bg-green-500" />

												Online

											</div>

										</div>

									</div>

									<button
										onClick={() => sendChallenge(player.userId)}
										className="rounded-lg bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200"
									>
										Challenge
									</button>

								</div>

							))}

						</div>

					</section>

					{/* Right Column */}

					<div className="flex w-full flex-col gap-4 lg:w-80">

						<div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<div className="text-xl font-semibold">
								Quick Play
							</div>

							<button className="rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200">
								Random Match
							</button>

							<button className="rounded-lg border border-zinc-700 bg-[#111111] px-4 py-3 transition hover:bg-zinc-800">
								Create Private Match
							</button>

						</div>

						{/* <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<div className="text-xl font-semibold">
								Coming Soon
							</div>

							<div className="flex flex-col gap-3 text-sm text-zinc-400">

								<div>👥 Friends</div>

								<div>💬 Messages</div>

								<div>🏆 Leaderboards</div>

								<div>🧩 Daily Puzzles</div>

								<div>🎯 Rated Matchmaking</div>

								<div>🏅 Tournaments</div>

							</div>

						</div> */}

						{/* <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<div className="text-xl font-semibold">
								Tips
							</div>

							<div className="text-sm leading-relaxed text-zinc-400">
								Challenge players directly, or use Quick Play to
								find a random opponent once matchmaking is available.
							</div>

						</div> */}

					</div>

				</div>

			</div>
		</main>
	);
}