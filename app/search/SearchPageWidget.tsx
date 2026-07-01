"use client";

import Link from "next/link";
import { TUser } from "@/lib/socket/stores/users";
import { UserPlus2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket/socket";
import { toast } from "sonner";
import { useState } from "react";

const SearchPageWidget = ({
	users,
}: {
	users: TUser[];
}) => {
	const { data: session, status } = useSession()
	const [sendingRequest, setSendingRequest] = useState<boolean>(false);

	// TODO same for challenges
	const handleSendFriendRequest = (toId: string, username: string) => {
		if (!session?.user?.id || toId === "") return;

		setSendingRequest(true);
		socket.emit(
			"friend_request:send",
			{ targetUserId: toId },
			(res: { success: boolean, error?: string }) => {
				if (res.success) {
					toast.success("Friend request sent");
					setSendingRequest(false);
				} else {
					toast.error(res.error);
					setSendingRequest(false);
				}
			}
		);
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

				{users.length === 0 ? (
					<div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-[#181818]">
						<span className="text-zinc-500">
							No players found.
						</span>
					</div>
				) : (
					<div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#181818]">

						{users.map((user, index) => (
							<div
								key={user.id}
								className={`flex items-center justify-between px-6 py-5 transition hover:bg-zinc-800 ${index !== users.length - 1
									? "border-b border-zinc-800"
									: ""
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

										<span className="text-zinc-500">
											Joined
										</span>

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

									<button
										disabled={sendingRequest}
										onClick={() => handleSendFriendRequest(user.id, user.username)}
										className="p-1 rounded-md cursor-pointer"
										style={{
											backgroundColor: sendingRequest ? "gray" : "white"
										}}
									>
										<UserPlus2 color="black" />
									</button>

								</div>

							</div>
						))}

					</div>
				)}

			</div>
		</main>
	);
};

export default SearchPageWidget;