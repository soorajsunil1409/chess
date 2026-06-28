"use client"

import BoardWidget from "@/components/board/BoardWidget";
import DetailsSidebar from "@/components/detailsBar/DetailsBar";
import GameActions from "@/components/detailsBar/GameActions";
import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { Check, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { toast } from "sonner";

const GamePageWidget = ({ gameId }: { gameId: string }) => {
	const router = useRouter();
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [drawRequested, setDrawRequested] = useState<boolean>(false);
	const [drawAccepted, setDrawAccepted] = useState<boolean>(false);
	const [drawDeclined, setDrawDeclined] = useState<boolean>(false);

	const { data: session } = useSession();

	useEffect(() => {
		const handleGetGameState = (gameState: GameState) => {
			setGameState(gameState);
		}

		const handleGameError = (error: string) => {
			toast.error(error)
			router.replace("/");
		}

		socket.off(
			"game:state",
			handleGetGameState
		);

		socket.off(
			"game:error",
			handleGameError
		);

		socket.on(
			"game:state",
			handleGetGameState
		);

		socket.on(
			"game:error",
			handleGameError
		);

		// if (socket.connected)
		socket.emit("game:join", gameId);

		return () => {
			socket.off("game:state", handleGetGameState);
			socket.off("game:error", handleGameError);
		}
	}, [gameId]);

	useEffect(() => {
		const handleGameUpdate = (
			data: GameState
		) => {
			setGameState(data);
			console.log(data);
		};

		const handleDrawRequest = () => {
			setDrawRequested(true);
		}

		const handleDrawAccepted = () => {
			setDrawAccepted(true);
		}

		const handleDrawDeclined = () => {
			console.log("SDF");
			setDrawDeclined(true);
		}

		socket.on(
			"game:update",
			handleGameUpdate
		);

		socket.on(
			"game:draw_requested",
			handleDrawRequest
		)

		socket.on(
			"game:draw_accepted",
			handleDrawAccepted
		)

		socket.on(
			"game:draw_declined",
			handleDrawDeclined
		)

		return () => {
			socket.off(
				"game:update",
				handleGameUpdate
			);
			socket.off(
				"game:draw_requested",
				handleGameUpdate
			);
			socket.off(
				"game:draw_accepted",
				handleDrawAccepted
			)
			socket.off(
				"game:draw_declined",
				handleDrawDeclined
			)
		};
	}, []);

	const handleAcceptDraw = () => {
		setDrawRequested(false);

		socket.emit("game:draw_accept", gameState?.gameId)
	}

	const handleDeclineDraw = () => {
		setDrawRequested(false);

		socket.emit("game:draw_decline", gameState?.gameId)
	}

	if (!gameState) return <div>Loading...</div>

	const isWhiteView = gameState.whitePlayerId === session?.user?.id;

	const topPlayerColor = isWhiteView ? "b" : "w";
	const bottomPlayerColor = isWhiteView ? "w" : "b";

	const topPlayer = isWhiteView ? gameState.blackPlayerUsername : gameState.whitePlayerUsername;
	const bottomPlayer = isWhiteView ? gameState.whitePlayerUsername : gameState.blackPlayerUsername;

	const topPlayerCapturedPieces = isWhiteView ? gameState.blacksCapturedPieces : gameState.whitesCapturedPieces;
	const bottomPlayerCapturedPieces = isWhiteView ? gameState.whitesCapturedPieces : gameState.blacksCapturedPieces;

	let topPlayerMaterialUpBy = 0;
	let bottomPlayerMaterialUpBy = 0;

	if (gameState.material.advantage < 0) {
		if (topPlayerColor === "b") topPlayerMaterialUpBy = Math.abs(gameState.material.advantage);
		else if (bottomPlayerColor === "b") bottomPlayerMaterialUpBy = Math.abs(gameState.material.advantage);
	} else if (gameState.material.advantage > 0) {
		if (topPlayerColor === "w") topPlayerMaterialUpBy = gameState.material.advantage;
		else if (bottomPlayerColor === "w") bottomPlayerMaterialUpBy = gameState.material.advantage;
	}

	const turn = gameState.turn === "w" ? "White" : "Black";

	return (
		<div className="flex flex-col md:flex-row h-max md:h-[92.7vh] gap-5 bg-[#333333] p-3">
			<div className="max-w-[10%] xl:flex-1"></div>
			<div className="flex-1 min-w-0 flex justify-center">
				<BoardWidget
					gameId={gameId}
					gameState={gameState}
					isWhiteView={isWhiteView}
					topPlayer={topPlayer}
					bottomPlayer={bottomPlayer}
					topPlayerCapturedPieces={topPlayerCapturedPieces}
					bottomPlayerCapturedPieces={bottomPlayerCapturedPieces}
					topPlayerColor={topPlayerColor}
					bottomPlayerColor={bottomPlayerColor}
					topPlayerMaterialUpBy={topPlayerMaterialUpBy}
					bottomPlayerMaterialUpBy={bottomPlayerMaterialUpBy}
				/>
			</div>

			<div className="w-full md:w-90 lg:w-110 md:min-w-90 flex h-[90%] md:flex-col flex-col-reverse gap-3">
				<DetailsSidebar
					turn={turn}
					gameState={gameState}
				/>

				{drawAccepted && (
					<div className="flex items-center justify-between rounded-md border border-[#3a3a3a] bg-[#222222] p-3 shadow-md">
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-white">
								Draw Accepted
							</span>
							<span className="text-sm text-gray-400">
								<strong className="text-gray-200">{topPlayer}</strong> has accepted your draw.
							</span>
						</div>
					</div>
				)}

				{drawDeclined && (
					<div className="flex items-center justify-between rounded-md border border-[#3a3a3a] bg-[#222222] p-3 shadow-md">
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-white">
								Draw Declined
							</span>
							<span className="text-sm text-gray-400">
								<strong className="text-gray-200">{topPlayer}</strong> has declined your draw.
							</span>
						</div>
						<div className="flex gap-2">
							<button
								className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2d2d2d] text-red-400 transition hover:bg-red-500 hover:text-white"
								onClick={() => setDrawDeclined(false)}
							>
								<X size={20} />
							</button>
						</div>
					</div>
				)}

				{drawRequested && (
					<div className="flex items-center justify-between rounded-md border border-[#3a3a3a] bg-[#222222] p-3 shadow-md">
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-white">
								Draw Offer
							</span>
							<span className="text-sm text-gray-400">
								<strong className="text-gray-200">{topPlayer}</strong> has offered a draw.
							</span>
						</div>

						<div className="flex gap-2">
							<button
								className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2d2d2d] text-green-400 transition hover:bg-green-500 hover:text-white"
								onClick={handleAcceptDraw}
							>
								<Check size={20} />
							</button>

							<button
								className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2d2d2d] text-red-400 transition hover:bg-red-500 hover:text-white"
								onClick={handleDeclineDraw}
							>
								<X size={20} />
							</button>
						</div>
					</div>
				)}

				<GameActions
					drawRequested={drawRequested}
					gameState={gameState}
				/>
			</div>
		</div>
	)
}
export default GamePageWidget

