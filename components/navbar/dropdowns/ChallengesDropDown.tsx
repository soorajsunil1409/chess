import { socket } from "@/lib/socket/socket";
import { useChallengeStore } from "@/store/challengeStore";
import { Challenge } from "@/lib/socket/stores/challenges";
import { Bell, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { acceptChallengeRequest } from "@/lib/challenges/acceptChallengeRequest";
import { toast } from "sonner";
import { declineChallengeRequest } from "@/lib/challenges/declineChallengeRequest";

const ChallengesDropDown = () => {
	const challenges = useChallengeStore((state) => state.challenges);
	const [loadingState, setLoadingState] = useState<
		"accept" | "decline" | null
	>(null);

	const [challengeOpen, setChallengeOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setChallengeOpen(false);
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

	const acceptChallenge = async (challenge: Challenge) => {
		setLoadingState("accept");
		const res = await acceptChallengeRequest(challenge.challengeId);
		setLoadingState(null);

		if (res.success) {
			toast.success("Challenge accepted");
		} else {
			toast.error(res.error);
		}
	};

	const declineChallenge = async (challenge: Challenge) => {
		setLoadingState("decline");
		const res = await declineChallengeRequest(challenge.challengeId);
		setLoadingState(null);

		if (res.success) {
			toast.success("Challenge declined");
		} else {
			toast.error(res.error);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>

			<button
				onClick={() =>
					setChallengeOpen(
						!challengeOpen
					)
				}
				className="relative rounded-lg p-2 transition hover:bg-zinc-800"
			>

				<Bell size={20} />

				{challenges.length > 0 && (

					<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">

						{challenges.length}

					</span>

				)}

			</button>

			{challengeOpen && (

				<div className="absolute z-100 right-0 mt-3 w-96 overflow-hidden rounded-xl border border-zinc-700 bg-[#181818] shadow-2xl">

					<div className="border-b border-zinc-700 p-4 font-semibold">
						Challenges
					</div>

					{challenges.length === 0 ? (

						<div className="p-6 text-center text-zinc-400">
							No pending challenges
						</div>

					) : (

						challenges.map((challenge) => (

							<div
								key={challenge.challengeId}
								className="flex items-center justify-between border-b border-zinc-800 p-4"
							>

								<div>

									<div className="font-medium">
										{
											challenge.fromUsername
										}
									</div>

									<div className="text-sm text-zinc-400">
										challenged you
									</div>

								</div>

								<div className="flex gap-2">

									<button
										disabled={loadingState === "accept"}
										onClick={() =>
											acceptChallenge(
												challenge
											)
										}
										className="rounded-lg bg-green-600 p-2 hover:bg-green-500"
										>

										<Check size={16} />

									</button>

									<button
										disabled={loadingState === "decline"}
										onClick={() =>
											declineChallenge(
												challenge
											)
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
export default ChallengesDropDown