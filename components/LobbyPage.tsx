import { socket } from "@/lib/socket";
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
		<main className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-4xl font-bold">
						Welcome Back {session?.user?.name}
					</h1>

					<p className="text-zinc-400">
						Challenge players and continue your games.
					</p>
				</div>

				<div className="flex gap-8">
					<section className="flex flex-1 flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">
								Online Players
							</h2>

							<span className="text-sm text-zinc-400">
								{onlinePlayers.length} Online
							</span>
						</div>

						<div className="flex flex-col gap-3">
							{
								onlinePlayers.map((player) => (
									<div
										key={player.userId}
										className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
									>
										<span>{player.username}</span>

										<button
											className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
											onClick={() => sendChallenge(player.userId)}
										>
											Challenge
										</button>
									</div>
								))
							}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}