"use client"

import { Chess } from "chess.js";
import { DbGameState } from "@/lib/socket/stores/games";
import Link from "next/link";

type Props = {
	games: DbGameState[];
	title?: string;
	showHeader?: boolean;
	maxGames?: number;
	className?: string;
};

const RecentGamesWidget = ({
	games,
	title = "Recent Games",
	showHeader = true,
	maxGames,
	className = "",
}: Props) => {

	const displayGames = (maxGames
		? games.slice(0, maxGames)
		: games
	).sort(
		(a, b) =>
			(new Date(b.endedAt ?? 0).getTime()) -
			(new Date(a.endedAt ?? 0).getTime())
	);

	return (
		<div
			className={`flex h-full min-h-0 flex-col bg-[#090909] overflow-hidden ${className}`}
		>
			{showHeader && (
				<div className="border-b border-zinc-800 px-6 py-4">
					<h2 className="text-xl font-bold text-white">
						{title}
					</h2>

					<p className="text-sm text-zinc-500">
						Click a game to review it.
					</p>
				</div>
			)}

			<div className="flex-1 min-h-0 overflow-y-auto">
				<table className="w-full text-sm">
					<thead className="sticky top-0 bg-[#181818]">
						<tr className="border-b border-zinc-800 text-zinc-400">
							<th className="px-5 py-4 text-left">
								Players
							</th>

							<th className="px-5 py-4 text-center">
								Result
							</th>

							<th className="px-5 py-4 text-center">
								Moves
							</th>

							<th className="px-5 py-4 text-center">
								Ending
							</th>

							<th className="px-5 py-4 text-right">
								Date
							</th>
						</tr>
					</thead>

					<tbody>
						{displayGames.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="py-12 text-center text-zinc-500"
								>
									No games found.
								</td>
							</tr>
						)}

						{displayGames.map((game, index) => {
							const chess = new Chess();
							chess.loadPgn(game.pgn);

							const moves = Math.ceil(chess.history().length / 2);

							const date = new Date(game.startedAt).toLocaleDateString(
								"en-IN",
								{
									day: "numeric",
									month: "short",
									year: "numeric",
								}
							);

							const result =
								game.winner === "w"
									? "1 - 0"
									: game.winner === "b"
										? "0 - 1"
										: "½ - ½";

							return (
								<tr
									key={game.id}
									className={`border-b border-zinc-800 transition hover:bg-zinc-800 ${index % 2 === 0 ? "bg-[#181818]" : "bg-[#1d1d1d]"
										}`}
								>
									<td colSpan={5} className="p-0">
										<Link
											href={`/review/${game.id}`}
											className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center"
										>
											<div className="px-5 py-4">
												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-3">
														<div className="h-2.5 w-2.5 rounded-sm bg-white" />
														<span className="font-medium text-white">
															{game.whitePlayerUsername}
														</span>
													</div>

													<div className="flex items-center gap-3">
														<div className="h-2.5 w-2.5 rounded-sm bg-zinc-500" />
														<span className="font-medium text-zinc-300">
															{game.blackPlayerUsername}
														</span>
													</div>
												</div>
											</div>

											<div className="px-5 py-4 text-center font-semibold text-white">
												{result}
											</div>

											<div className="px-5 py-4 text-center text-zinc-300">
												{moves}
											</div>

											<div className="px-5 py-4 text-center text-zinc-400">
												{game.result
													? game.result.charAt(0).toUpperCase() +
													game.result.slice(1)
													: "-"}
											</div>

											<div className="px-5 py-4 text-right text-zinc-400">
												{date}
											</div>
										</Link>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentGamesWidget;