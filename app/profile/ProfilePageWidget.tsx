"use client";

import { useSession } from "next-auth/react";
import RecentGamesWidget from "@/components/RecentGamesWidget";
import Link from "next/link";
import { useMemo } from "react";
import { DbGameState } from "@/lib/socket/stores/games";
import { TUser } from "@/lib/api/getUser";
import ProfileSkeleton from "./ProfileSkeleton";

const ProfilePageWidget = ({
	user,
	games
}: {
	user: TUser,
	games: DbGameState[]
}) => {
	const { data: session } = useSession();

	const isOwnProfile = session?.user?.id === user.id;

	const stats = useMemo(() => {
		let wins = 0;
		let losses = 0;
		let draws = 0;

		for (const game of games) {
			if (game.winner === "draw") {
				draws++;
			} else if (
				(game.whitePlayerUsername === user?.username && game.winner === "w") ||
				(game.blackPlayerUsername === user?.username && game.winner === "b")
			) {
				wins++;
			} else {
				losses++;
			}
		}

		return { wins, losses, draws };
	}, [games, user]);

	if (!user) {
		return <ProfileSkeleton />;
	}

	return (
		<main className="flex w-full items-center justify-center p-6 lg:min-h-0 bg-[#090909] flex-col flex-1">
			<div className="flex w-full max-w-7xl flex-col gap-6 lg:min-h-0">

				<div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#181818] p-6">

					<div className="flex items-center gap-5">

						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-700 text-4xl font-bold text-white">
							{user?.username
								?.charAt(0)
								.toUpperCase()}
						</div>

						<div className="flex flex-col gap-2">

							<h1 className="text-3xl font-bold text-white">
								{user?.username}
							</h1>

							<span className="text-zinc-400">
								{user?.email}
							</span>

						</div>

					</div>

					{
						isOwnProfile &&
						<button className="rounded-lg border border-zinc-700 bg-[#111111] px-5 py-3 transition hover:bg-zinc-800">
							Edit Profile
						</button>
					}

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
							{stats.wins}
						</span>

					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Losses
						</span>

						<span className="text-3xl font-bold text-white">
							{stats.losses}
						</span>

					</div>

					<div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-[#181818] p-5">

						<span className="text-sm text-zinc-500">
							Draws
						</span>

						<span className="text-3xl font-bold text-white">
							{stats.draws}
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
								href={isOwnProfile ? "/games" : `/games/${user.id}`}
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
									{user?.username}
								</span>

							</div>

							<div className="flex items-center justify-between gap-4">

								<span className="text-zinc-500">
									Email
								</span>

								<span className="truncate text-right text-white">
									{user?.email}
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
									{user?.createdAt
										? new Date(user.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})
										: "—"}
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
											(stats.wins / games.length) *
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

export default ProfilePageWidget;