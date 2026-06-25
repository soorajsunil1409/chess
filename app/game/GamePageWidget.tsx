"use client"

import BoardWidget from "@/components/board/BoardWidget";
import CapturedPiecesWidget from "@/components/CapturedPiecesWidget";
import { Separator } from "@/components/ui/separator";
import { socket } from "@/lib/socket";
import { games, GameState } from "@/lib/socket/stores/games";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner";

const GamePageWidget = ({ gameId }: { gameId: string }) => {
	const router = useRouter();
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [showResignPopup, setShowResignPopup] = useState(false);
	const resignPopupRef = useRef<HTMLDivElement>(null);

	const { data: session } = useSession();

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
			console.log(data.history);
		};

		socket.on(
			"game:update",
			handleGameUpdate
		);

		return () => {
			socket.off(
				"game:update",
				handleGameUpdate
			);
		};
	}, []);

	const handleResign = () => {
		setShowResignPopup(false);

		socket.emit("game:resign", gameId)
	}

	const formattedHistory = useMemo(() => {
		const history = []

		for (let i = 0; i < gameState?.history?.length!; i += 2) {
			history.push({
				moveNumber: Math.floor(i / 2) + 1,
				white: gameState?.history[i],
				black: gameState?.history[i + 1] ?? "",
			});
		}

		return history;

	}, [gameState?.history]);


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

	console.log(gameState);

	return (
		<div className="flex flex-col md:flex-row h-max md:h-[92.7vh] gap-5 bg-[#333333] p-3">
			<div className="flex-1 min-w-0 flex justify-center">
				<div className=" p-2 rounded flex flex-col gap-2 max-h-[90vh]">
					<CapturedPiecesWidget
						capturedPieces={topPlayerCapturedPieces}
						color={bottomPlayerColor}
						name={topPlayer}
						material={topPlayerMaterialUpBy !== 0 ? topPlayerMaterialUpBy : ""}
					/>

					<div className="aspect-square relative max-h-[74vh] w-auto max-w-[76vh]">
						<BoardWidget
							gameId={gameId}
							gameState={gameState}
							isWhiteView={isWhiteView}
						/>

						{
							gameState.status?.isGameOver &&
							<div className="size-full absolute inset-0 flex items-center justify-center">
								<div
									className="w-100 rounded-lg overflow-hidden bg-[#3a3a3a] shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),0_6.7px_5.3px_rgba(0,0,0,0.048),0_12.5px_10px_rgba(0,0,0,0.06),0_22.3px_17.9px_rgba(0,0,0,0.072),0_41.8px_33.4px_rgba(0,0,0,0.086),0_100px_80px_rgba(0,0,0,0.12)]"
								>
									<div className="w-full text-center flex flex-col p-3 text-white">
										<div className="text-2xl font-bold">
											{gameState.winner === "w" ? "White" : "Black"} won
										</div>
										<div className="text-md">
											by {gameState.result}
										</div>
									</div>
									<div className="w-full flex justify-center p-5 bg-[#222] text-xl text-white font-bold">
										<button
											className="cursor-pointer py-2 px-5 bg-linear-to-t border border-b-[#5c8943] border-x-[#78a52f] border-t-[#a9ce6d] from-[#658f4e] to-[#a9ce6d] w-full rounded-2xl"
										>
											Go to Lobby
										</button>
									</div>
								</div>
							</div>
						}
					</div>

					<CapturedPiecesWidget
						capturedPieces={bottomPlayerCapturedPieces}
						color={topPlayerColor}
						name={bottomPlayer}
						material={bottomPlayerMaterialUpBy !== 0 ? bottomPlayerMaterialUpBy : ""}
					/>
				</div>
			</div>

			<div className="lg:w-110 md:w-90 w-full min-w-75 shrink-0 md:h-full bg-[#333333]">
				<div className="w-full h-full bg-[#222222] rounded-md flex flex-col">
					<div className="flex gap-3 items-center p-5">
						<div className="size-6 rounded" style={{ backgroundColor: turn.toLocaleLowerCase() }}></div>
						<div className="text-2xl text-white font-bold">{turn} to Move</div>
					</div>
					<Separator />
					<div className="overflow-auto rounded-md">
						<table className="w-full text-sm text-zinc-300">
							<thead>
								<tr className="bg-[#2a2a2a] text-zinc-100">
									<th className="px-3 py-2 text-left w-12">#</th>
									<th className="px-3 py-2 text-left">White</th>
									<th className="px-3 py-2 text-left">Black</th>
								</tr>
							</thead>

							<tbody>
								{
									formattedHistory.map((move) => (
										<tr
											key={move.moveNumber}
											className={
												move.moveNumber % 2 === 0
													? "bg-[#2a2a2a]"
													: "bg-[#222222]"
											}
										>
											<td className="px-3 py-2 font-bold">
												{move.moveNumber}.
											</td>

											<td className="px-3 py-2 font-semibold">
												{move.white}
											</td>

											<td className="px-3 py-2 font-semibold">
												{move.black}
											</td>
										</tr>
									))
								}
							</tbody>
						</table>
					</div>
					<Separator />

					<div className="flex-1 w-full"></div>

					<div className="w-full flex flex-col">
						{/* <div className=""></div> */}
						<div className="flex p-3 gap-3 text-white font-bold text-center">
							<div className="relative w-full" ref={resignPopupRef}>
								<button
									disabled={gameState.status.isGameOver}
									onClick={() => setShowResignPopup(true)}
									className="cursor-pointer p-3 w-full border border-[#222222] rounded-md bg-linear-to-t from-[#2d2d2d] to-[#464646] shadow-md text-white font-bold"
								>
									Resign
								</button>

								{showResignPopup && (
									<div
										className="absolute bottom-full mb-3 z-50 w-full"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="rounded-xl border border-zinc-300 bg-zinc-100 shadow-2xl overflow-hidden">
											<div className="p-4 flex flex-col gap-4">
												<div className="text-center">
													<p className="text-sm text-zinc-600">
														Are you sure you want to resign?
													</p>
												</div>

												<div className="flex gap-3 text-sm">
													<button
														disabled={gameState.status.isGameOver}
														onClick={() =>
															setShowResignPopup(false)
														}
														className="cursor-pointer flex-1 py-2 px-1 rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-200 transition"
													>
														Cancel
													</button>

													<button
														disabled={gameState.status.isGameOver}
														onClick={handleResign}
														className="cursor-pointer flex-1 py-2 px-1 rounded-md font-bold text-white bg-linear-to-t from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 transition"
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
							{/* <div
								disabled={gameState.status.isGameOver}
								className="cursor-pointer p-3 w-full border border-[#222222] rounded-md bg-linear-to-t from-[#2d2d2d] to-[#464646] shadow-md"
							>Draw
							</div> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default GamePageWidget