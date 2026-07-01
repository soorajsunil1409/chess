import { socket } from "@/lib/socket/socket";
import { FriendRequest } from "@/lib/socket/stores/friends";
import { useFriendRequestStore } from "@/store/friendRequestStore";
import { Check, Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FriendRequestDropDown = () => {
	const friendRequests = useFriendRequestStore((state) => state.friendRequests);

	const [
		messageOpen,
		setMessageOpen,
	] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setMessageOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener(
				"mousedown",
				handleClickOutside
			);
		};
	}, []);

	const acceptFriendRequest = (request: FriendRequest) => {
		socket.emit("friend_request:accept", request.id);
		setMessageOpen(false);
	};

	const rejectFriendRequest = (request: FriendRequest) => {
		socket.emit("friend_request:reject", request.id);
		setMessageOpen(false);
	};

	return (
		<div className="relative" ref={dropdownRef}>

			<button
				onClick={() => setMessageOpen(!messageOpen)}
				className="relative rounded-lg p-2 transition hover:bg-zinc-800"
			>
				<Mail size={20} />

				{friendRequests.length > 0 && (
					<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
						{friendRequests.length}
					</span>
				)}

			</button>

			{messageOpen && (

				<div className="absolute right-0 z-100 mt-3 w-96 overflow-hidden rounded-xl border border-zinc-700 bg-[#181818] shadow-2xl">

					<div className="border-b border-zinc-700 p-4 font-semibold">
						Friend Requests
					</div>

					{friendRequests.length === 0 ? (

						<div className="p-6 text-center text-zinc-400">
							No pending friend requests
						</div>

					) : (

						friendRequests.map((request) => (

							<div
								key={request.id}
								className="flex items-center justify-between border-b border-zinc-800 p-4"
							>

								<div>
									<div className="font-medium">
										{request.fromUsername}
									</div>

									<div className="text-sm text-zinc-400">
										sent you a friend request
									</div>

								</div>

								<div className="flex gap-2">

									<button
										onClick={() =>
											acceptFriendRequest(request)
										}
										className="rounded-lg bg-green-600 p-2 hover:bg-green-500"
									>
										<Check size={16} />
									</button>

									<button
										onClick={() =>
											rejectFriendRequest(request)
										}
										className="rounded-lg bg-red-600 p-2 hover:bg-red-500"
									>
										<X size={16} />
									</button>

								</div>

							</div>

						))

					)}

				</div>

			)}

		</div>
	)
}
export default FriendRequestDropDown