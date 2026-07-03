"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Friend } from "@/lib/socket/stores/friends";
import { useFriendsStore } from "@/store/friendsStore";
import { Search, Users } from "lucide-react";
import Image from "next/image";

const FriendsPageWidget = () => {
	const friends = useFriendsStore((state) => state.friends);

	return (
		<div className="flex h-full flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Users className="h-5 w-5 text-zinc-400" />
					<h2 className="text-lg font-semibold text-white">
						Friends
					</h2>
					<div className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
						{friends.length}
					</div>
				</div>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
				<Input
					placeholder="Search friends..."
					className="border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-500"
				/>
			</div>

			<ScrollArea className="flex-1">
				<div className="flex flex-col gap-2 pr-2">
					{friends.length === 0 ? (
						<div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-800 text-sm text-zinc-500">
							No friends yet.
						</div>
					) : (
						friends.map((friend) => (
							<div
								key={friend.user.id}
								className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-white">
										{friend.user.username
											.charAt(0)
											.toUpperCase()}
									</div>

									<div className="flex flex-col">
										<span className="font-medium text-white">
											{friend.user.username}
										</span>
										<span className="text-xs text-zinc-500">
											friend.user.email
										</span>
									</div>
								</div>

								<div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
							</div>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default FriendsPageWidget;