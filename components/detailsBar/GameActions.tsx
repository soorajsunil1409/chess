import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type GameActionsProps = {
	gameState: GameState;
	drawRequested: boolean;
};

const GameActions = ({
	gameState,
	drawRequested
}: GameActionsProps) => {
	const [showResignPopup, setShowResignPopup] = useState(false);
	const resignPopupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				resignPopupRef.current &&
				!resignPopupRef.current.contains(event.target as Node)
			) {
				setShowResignPopup(false);
			}
		};

		if (showResignPopup) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showResignPopup]);

	const handleResign = () => {
		setShowResignPopup(false);

		socket.emit("game:resign", gameState.gameId)
	}

	const handleDrawRequest = () => {
		socket.emit("game:draw_request", gameState.gameId)

		toast.info("Draw request sent");
	}

	return (
		<div className="flex gap-3 w-full justify-center p-3 bg-[#222222] rounded-md">
			<div
				className="relative flex-1"
				ref={resignPopupRef}
			>
				<button
					disabled={gameState.status.isGameOver}
					onClick={() => setShowResignPopup(true)}
					className="w-full cursor-pointer rounded-md border border-[#222222] bg-linear-to-t from-[#2d2d2d] to-[#464646] p-3 font-bold text-white shadow-md"
				>
					Resign
				</button>

				{showResignPopup && (
					<div
						className="absolute bottom-full z-50 mb-3 w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-2xl">
							<div className="flex flex-col gap-4 p-4">
								<p className="text-center text-sm text-zinc-600">
									Are you sure you want to resign?
								</p>

								<div className="flex gap-3">
									<button
										disabled={gameState.status.isGameOver}
										onClick={() =>
											setShowResignPopup(false)
										}
										className="flex-1 cursor-pointer rounded-md border border-zinc-300 bg-white px-2 py-2 text-zinc-700 transition hover:bg-zinc-200"
									>
										Cancel
									</button>

									<button
										disabled={gameState.status.isGameOver}
										onClick={handleResign}
										className="flex-1 cursor-pointer rounded-md bg-linear-to-t from-orange-500 to-orange-400 px-2 py-2 font-bold text-white transition hover:from-orange-600 hover:to-orange-500"
									>
										Resign
									</button>
								</div>
							</div>

							<div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-zinc-100" />
						</div>
					</div>
				)}
			</div>

			<div
				className="relative flex-1"
			>
				<button
					disabled={gameState.status.isGameOver || drawRequested}
					onClick={handleDrawRequest}
					className="w-full cursor-pointer rounded-md border border-[#222222] bg-linear-to-t from-[#2d2d2d] to-[#464646] p-3 font-bold text-white shadow-md"
				>
					Draw
				</button>
			</div>
		</div>
	);
};

export default GameActions;