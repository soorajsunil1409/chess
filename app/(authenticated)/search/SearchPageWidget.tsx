"use client";

import Link from "next/link";
import { TUser } from "@/lib/socket/stores/users";
import { Check, UserPlus2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useFriendsStore } from "@/store/friendsStore";
import { sendFriendRequest } from "@/lib/friends/sendFriendRequest";
import { useFriendRequestStore } from "@/store/friendRequestStore";
import { acceptFriendRequest } from "@/lib/friends/acceptFriendRequest";
import { rejectFriendRequest } from "@/lib/friends/rejectFriendRequest";
import { unsendFriendRequest } from "@/lib/friends/unsendFriendRequest";

const SearchPageWidget = ({
	users,
}: {
	users: TUser[];
}) => {
	const [sendingRequest, setSendingRequest] = useState<boolean>(false);

	const incomingFriendRequests = useFriendRequestStore((state) => state.incomingFriendRequests);
	const outgoingFriendRequests = useFriendRequestStore((state) => state.outgoingFriendRequests);
	const friendIds = useFriendsStore((state) => state.friendIds);
	const friends = users.filter((user) => friendIds.has(user.id));
	const otherPlayers = users.filter((user) => !friendIds.has(user.id));

	// TODO same for challenges
	const handleSendFriendRequest = async (toId: string) => {
		if (!toId) return;

		setSendingRequest(true);

		const res = await sendFriendRequest(toId);

		setSendingRequest(false);

		if (res.success) {
			toast.success("Friend request sent");
		} else {
			toast.error(res.error);
		}
	}

	const handleUnsendFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setSendingRequest(true);
		const res = await unsendFriendRequest(requestId);
		setSendingRequest(false);

		if (res.success) {
			toast.success("Request declined");
		} else {
			toast.error(res.error ?? "Failed to decline the request");
		}
	}

	const handleAcceptFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setSendingRequest(true);
		const res = await acceptFriendRequest(requestId);
		setSendingRequest(false);

		if (res.success) {
			toast.success("Request accepted");
		} else {
			toast.error(res.error ?? "Failed to accept the request");
		}
	};

	const handleRejectFriendRequest = async (requestId: string) => {
		if (!requestId) return;

		setSendingRequest(true);
		const res = await rejectFriendRequest(requestId);
		setSendingRequest(false);

		if (res.success) {
			toast.success("Request declined");
		} else {
			toast.error(res.error ?? "Failed to decline the request");
		}
	};

	const renderUserRow = (
		user: TUser,
		index: number,
		total: number,
		isFriend: boolean
	) => {
		const incomingRequest = incomingFriendRequests.find((request) => request.fromUserId === user.id);
		const outgoingRequest = outgoingFriendRequests.find((request) => request.toUserId === user.id);
		// console.log(requestExists);

		return (
			<div
				key={user.id}
				className={`flex items-center justify-between px-6 py-5 transition hover:bg-zinc-800 ${index !== total - 1 ? "border-b border-zinc-800" : ""
					}`}
			>
				<div className="flex items-center gap-4">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold text-white">
						{user.username.charAt(0).toUpperCase()}
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-lg font-semibold text-white">
							{user.username}
						</span>

						<span className="text-sm text-zinc-400">
							{user.email}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-6">
					<div className="hidden flex-col items-end text-sm md:flex">
						<span className="text-zinc-500">Joined</span>

						<span className="text-zinc-300">
							{new Date(user.createdAt).toLocaleDateString(
								"en-US",
								{
									month: "short",
									year: "numeric",
								}
							)}
						</span>
					</div>

					<Link
						href={`/profile/${user.id}`}
						className="rounded-lg border border-zinc-700 bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
					>
						View Profile
					</Link>

					{!isFriend && (
						incomingRequest ? (
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleAcceptFriendRequest(incomingRequest.id)}
									className="rounded-lg bg-green-600 p-2 transition hover:bg-green-500"
								>
									<Check size={16} />
								</button>

								<button
									onClick={() => handleRejectFriendRequest(incomingRequest.id)}
									className="rounded-lg bg-red-600 p-2 transition hover:bg-red-500"
								>
									<X size={16} />
								</button>
							</div>
						) : outgoingRequest ? (
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleUnsendFriendRequest(outgoingRequest.id)}
									className="rounded-lg bg-red-600 p-2 transition hover:bg-red-500"
								>
									<X size={16} />
								</button>
							</div>
						) : (
							<button
								disabled={sendingRequest}
								onClick={() => handleSendFriendRequest(user.id)}
								className="rounded-md bg-white p-1 disabled:bg-gray-500"
							>
								<UserPlus2 color="black" />
							</button>
						)
					)}
				</div>
			</div>
		)
	}

	return (
		<main className="flex flex-col w-full bg-[#090909] p-6 flex-1 justify-start items-center">
			<div className="flex w-full max-w-5xl flex-col gap-6">

				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold text-white">
						Search Results
					</h1>

					<p className="text-zinc-400">
						Found {users.length} {users.length === 1 ? "player" : "players"}.
					</p>
				</div>

				<div className="flex flex-col gap-6">

					{friends.length > 0 && (
						<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#181818]">

							<div className="border-b border-zinc-800 px-6 py-4">
								<h2 className="text-lg font-semibold text-white">
									Friends ({friends.length})
								</h2>
							</div>

							{friends.map((user, index) =>
								renderUserRow(
									user,
									index,
									friends.length,
									true
								)
							)}

						</div>
					)}

					{otherPlayers.length > 0 && (
						<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#181818]">

							<div className="border-b border-zinc-800 px-6 py-4">
								<h2 className="text-lg font-semibold text-white">
									Other Players ({otherPlayers.length})
								</h2>
							</div>

							{otherPlayers.map((user, index) =>
								renderUserRow(
									user,
									index,
									otherPlayers.length,
									false
								)
							)}

						</div>
					)}

					{friends.length === 0 && otherPlayers.length === 0 && (
						<div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-[#181818]">
							<span className="text-zinc-500">
								No players found.
							</span>
						</div>
					)}

				</div>

			</div>
		</main>
	);
};

export default SearchPageWidget;