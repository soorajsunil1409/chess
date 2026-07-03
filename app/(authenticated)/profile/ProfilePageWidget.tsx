"use client";

import { useSession } from "next-auth/react";
import RecentGamesWidget from "@/components/RecentGamesWidget";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DbGameState } from "@/lib/socket/stores/games";
import { TUser } from "@/lib/socket/stores/users";
import ProfileSkeleton from "./ProfileSkeleton";
import { useFriendsStore } from "@/store/friendsStore";
import { sendFriendRequest } from "@/lib/friends/sendFriendRequest";
import { toast } from "sonner";
import { useFriendRequestStore } from "@/store/friendRequestStore";
import { unsendFriendRequest } from "@/lib/friends/unsendFriendRequest";
import { acceptFriendRequest } from "@/lib/friends/acceptFriendRequest";
import { rejectFriendRequest } from "@/lib/friends/rejectFriendRequest";
import { Check, Clock3, UserCheck, UserMinus, UserPlus, X } from "lucide-react";
import { removeFriend } from "@/lib/friends/removeFriend";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ProfilePageWidget = ({
	user,
	games
}: {
	user: TUser,
	games: DbGameState[]
}) => {
	const { data: session } = useSession();
	const [loadingAction, setLoadingAction] = useState<
		"send" | "unsend" | "accept" | "reject" | "remove" | null
	>(null);

	const incomingFriendRequests = useFriendRequestStore((state) => state.incomingFriendRequests);
	const outgoingFriendRequests = useFriendRequestStore((state) => state.outgoingFriendRequests);

	const isOwnProfile = session?.user?.id === user.id;
	const isFriend = useFriendsStore((state) => state.isFriend(user.id));

	const handleSendFriendRequest = async (toId: string) => {
		if (!toId) return;

		setLoadingAction("send");
		const res = await sendFriendRequest(toId);
		setLoadingAction(null);

		if (res.success) {
			toast.success("Friend request sent");
		} else {
			toast.error(res.error);
		}
	}

	const handleUnsendFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setLoadingAction("unsend");
		const res = await unsendFriendRequest(requestId);
		setLoadingAction(null);

		if (res.success) {
			toast.success("Request cancelled");
		} else {
			toast.error(res.error ?? "Failed to decline the request");
		}
	}

	const handleAcceptFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setLoadingAction("accept");
		const res = await acceptFriendRequest(requestId);
		setLoadingAction(null);

		if (res.success) {
			toast.success("Request accepted");
		} else {
			toast.error(res.error ?? "Failed to accept the request");
		}
	};

	const handleRejectFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setLoadingAction("reject");
		const res = await rejectFriendRequest(requestId);
		setLoadingAction(null);

		if (res.success) {
			toast.success("Request declined");
		} else {
			toast.error(res.error ?? "Failed to decline the request");
		}
	};

	const handleRemoveFriend = async (userId: string) => {
		if (!session?.user?.id || !userId) return;

		// console.log("test");
		const user1Id = session.user.id;
		const user2Id = userId;

		setLoadingAction("remove");
		const res = await removeFriend(user1Id, user2Id);
		setLoadingAction(null);

		if (!res.success) {
			toast.error(res.error ?? "Failed to remove friend");
		}
	};

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

	const incomingFriendRequest = incomingFriendRequests.find((request) => request.fromUserId === user.id);
	const outgoingFriendRequest = outgoingFriendRequests.find((request) => request.toUserId === user.id);

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
						<div className="flex items-center gap-2">
							{isFriend ? (
								<div className="flex items-center gap-2">
									<button
										disabled
										className="flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
									>
										<UserCheck className="h-4 w-4" />
										Friends
									</button>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												disabled={loadingAction === "remove"}
												className="border-red-600/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
											>
												<UserMinus className="h-4 w-4" />
												Remove
											</Button>
										</AlertDialogTrigger>

										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Remove friend?</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to remove this friend? You'll need to send a new
													friend request if you want to connect again.
												</AlertDialogDescription>
											</AlertDialogHeader>

											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													disabled={loadingAction === "remove"}
													onClick={() => handleRemoveFriend(user.id)}
													className="bg-red-600 hover:bg-red-700"
												>
													{loadingAction === "remove" ? "Removing..." : "Remove Friend"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							) : outgoingFriendRequest ? (
								<button
									disabled={loadingAction === "unsend"}
									onClick={() => handleUnsendFriendRequest(outgoingFriendRequest.id)}
									className="flex items-center gap-2 rounded-full border border-yellow-600/30 bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-400 transition hover:bg-yellow-500/20 disabled:opacity-50"
								>
									<Clock3 className="h-4 w-4" />
									Pending
								</button>
							) : incomingFriendRequest ? (
								<>
									<button
										disabled={loadingAction === "accept"}
										onClick={() => handleAcceptFriendRequest(incomingFriendRequest.id)}
										className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
									>
										<Check className="h-4 w-4" />
										Accept
									</button>

									<button
										disabled={loadingAction === "reject"}
										onClick={() => handleRejectFriendRequest(incomingFriendRequest.id)}
										className="flex items-center gap-2 rounded-full border border-red-600/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
									>
										<X className="h-4 w-4" />
										Decline
									</button>
								</>
							) : !isOwnProfile &&  (
								<button
									disabled={loadingAction === "send"}
									onClick={() => handleSendFriendRequest(user.id)}
									className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
								>
									<UserPlus className="h-4 w-4" />
									Add Friend
								</button>
							)}
						</div>
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