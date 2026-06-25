"use client"

import { DbGameState } from "@/lib/socket/stores/games"
import { Chess } from "chess.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

const GamesPage = () => {
	const router = useRouter();
	const [userGames, setUserGames] = useState<DbGameState[]>([]);

	useEffect(() => {
		const getGames = async () => {
			const res = await fetch("/api/games");

			const { games } = await res.json();

			setUserGames(games);

			console.log(games);
		}

		getGames();
	}, []);

	return (
		<div className="w-full h-max md:h-full flex flex-col md:flex-row bg-[#333] md:max-h-[92%]">
			{/* Main Panel */}
			<div className="flex-1 p-5 md:p-7 md:pr-3">
				<div className="h-full md:min-h-[70vh] rounded-2xl bg-[#222] border border-zinc-800 shadow-xl flex flex-col overflow-hidden">
					<div className="border-b border-zinc-800 px-6 py-4">
						<h1 className="text-2xl font-bold text-white">
							Game History
						</h1>

						<p className="text-sm text-zinc-400">
							View and analyze your previous games
						</p>
					</div>

					<div className="flex-1 min-h-0 overflow-auto">
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-[#222] z-10">
								<tr className="border-b border-[#454545] text-zinc-400">
									<th className="text-left py-4 px-5 font-medium">
										Players
									</th>

									<th className="text-center py-4 px-5 font-medium">
										Result
									</th>

									<th className="text-center py-4 px-5 font-medium">
										Moves
									</th>

									<th className="text-right py-4 px-5 font-medium">
										Date
									</th>
								</tr>
							</thead>

							<tbody>
								{userGames.map((game, index) => {
									const chess = new Chess();

									chess.loadPgn(game.pgn);

									const moves = Math.ceil(
										chess.history().length / 2
									);

									const date = new Date(
										game.startedAt
									).toLocaleDateString(
										"en-IN",
										{
											day: "numeric",
											month: "short",
											year: "numeric",
										}
									);

									const result =
										game.winner === "w"
											? [1, 0]
											: game.winner === "b"
												? [0, 1]
												: ["½", "½"];

									return (
										<tr
											key={game.id}
											onClick={() => router.push(`/review/${game.id}`)}
											className={`border-b border-[#2f2f2f] cursor-pointer transition hover:bg-[#303030]
											${index % 2 === 0
													? "bg-[#222]"
													: "bg-[#272727]"
												}
										`}
										>
											<td className="px-5 py-4">
												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-3">
														<div className="size-2.5 bg-white rounded-xs" />

														<span className="font-semibold text-white">
															{
																game.whitePlayerUsername
															}
														</span>
													</div>

													<div className="flex items-center gap-3">
														<div className="size-2.5 bg-[#666] rounded-xs" />

														<span className="font-semibold text-zinc-300">
															{
																game.blackPlayerUsername
															}
														</span>
													</div>
												</div>
											</td>

											<td className="px-5 py-4 text-center font-semibold text-zinc-200">
												{result[0]} - {result[1]}
											</td>

											<td className="px-5 py-4 text-center text-zinc-300">
												{moves}
											</td>

											<td className="px-5 py-4 text-right text-zinc-400">
												{date}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Sidebar */}
			<div className="lg:w-96 md:w-80 w-full p-5 md:p-7 md:pl-3">
				<div className="h-full min-h-[40vh] bg-[#222] rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
					<div className="border-b border-zinc-800 px-5 py-4">
						<h2 className="text-lg font-bold text-white">
							Recent Activity
						</h2>
					</div>

					<div className="p-4 flex flex-col gap-3">
						<div className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800">
							<div className="text-white font-semibold">
								12 Games
							</div>

							<div className="text-sm text-zinc-400">
								Played this week
							</div>
						</div>

						<div className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800">
							<div className="text-white font-semibold">
								62%
							</div>

							<div className="text-sm text-zinc-400">
								Win Rate
							</div>
						</div>

						<div className="bg-[#2a2a2a] rounded-xl p-4 border border-zinc-800">
							<div className="text-white font-semibold">
								+48
							</div>

							<div className="text-sm text-zinc-400">
								Rating Change
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GamesPage