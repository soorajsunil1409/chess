"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { DbGameState } from "@/lib/socket/stores/games";
import RecentGamesWidget from "@/components/RecentGamesWidget";
import Link from "next/link";
import { useGamesStore } from "@/store/gamesStore";

const ProfilePage = () => {
	const { data: session } = useSession();

	const games = useGamesStore((state) => state.games);

	const wins = games.filter((g) => {
		if (!session) return false;

		return (
			(g.whitePlayerUsername ===
				session.user?.name &&
				g.winner === "w") ||
			(g.blackPlayerUsername ===
				session.user?.name &&
				g.winner === "b")
		);
	}).length;

	const losses = games.filter((g) => {
		if (!session) return false;

		return (
			(g.whitePlayerUsername ===
				session.user?.name &&
				g.winner === "b") ||
			(g.blackPlayerUsername ===
				session.user?.name &&
				g.winner === "w")
		);
	}).length;

	const draws = games.filter(
		(g) => g.winner === "draw"
	).length;

	return (
		<main className="flex w-full justify-center p-6 lg:min-h-0 bg-[#090909] flex-col flex-1">
			<div className="flex w-full max-w-7xl flex-col gap-6 lg:min-h-0">

				<div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#181818] p-6">

					<div className="flex items-center gap-5">

						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-700 text-4xl font-bold text-white">
							{session?.user?.name
								?.charAt(0)
								.toUpperCase()}
						</div>

						<div className="flex flex-col gap-2">

							<h1 className="text-3xl font-bold text-white">
								{session?.user?.name}
							</h1>

							<span className="text-zinc-400">
								{session?.user?.email}
							</span>

						</div>

					</div>

					<button className="rounded-lg border border-zinc-700 bg-[#111111] px-5 py-3 transition hover:bg-zinc-800">
						Edit Profile
					</button>

				</div>

				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Games
						</span>

						<span className="text-3xl font-bold text-white">
							{games.length}
						</span>

					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Wins
						</span>

						<span className="text-3xl font-bold text-white">
							{wins}
						</span>

					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Losses
						</span>

						<span className="text-3xl font-bold text-white">
							{losses}
						</span>

					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Draws
						</span>

						<span className="text-3xl font-bold text-white">
							{draws}
						</span>

					</div>

				</div>

				<div className="flex flex-col gap-6 lg:flex-row lg:min-h-0">

					<div className="flex flex-1 flex-col min-h-0 gap-4">

						<div className="flex items-center justify-between">

							<h2 className="text-xl font-semibold text-white">
								Recent Games
							</h2>

							<Link
								href="/games"
								className="rounded-lg border border-zinc-700 bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
							>
								View All
							</Link>

						</div>

						<RecentGamesWidget
							games={games}
							showHeader={false}
							maxGames={4}
							className="flex-1 min-h-0"
						/>

					</div>

					<div className="flex w-full flex-col gap-4 lg:w-80">

						<div className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<h2 className="text-lg font-semibold text-white">
								Account
							</h2>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Username
								</span>

								<span className="text-white">
									{session?.user?.name}
								</span>

							</div>

							<div className="flex items-center justify-between gap-4">

								<span className="text-zinc-500">
									Email
								</span>

								<span className="truncate text-right text-white">
									{session?.user?.email}
								</span>

							</div>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Friends
								</span>

								<span className="text-white">
									0
								</span>

							</div>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Joined
								</span>

								<span className="text-white">
									—
								</span>

							</div>

						</div>

						<div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<h2 className="text-lg font-semibold text-white">
								Overview
							</h2>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Win Rate
								</span>

								<span className="text-white">
									{games.length === 0
										? "0%"
										: `${Math.round(
											(wins / games.length) *
											100
										)}%`}
								</span>

							</div>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Last Game
								</span>

								<span className="text-white">
									{games.length === 0
										? "—"
										: "Recently"}
								</span>

							</div>

							<div className="flex items-center justify-between">

								<span className="text-zinc-500">
									Status
								</span>

								<span className="text-white">
									Online
								</span>

							</div>

						</div>

					</div>

				</div>

			</div>
		</main>
	);
};

export default ProfilePage;