"use client"

import BoardWidget from "@/components/board/BoardWidget";
import CapturedPiecesWidget from "@/components/CapturedPiecesWidget";
import { Separator } from "@/components/ui/separator";
import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner";

const GamePageWidget = ({ gameId }: { gameId: string }) => {
	const router = useRouter();
	const [gameState, setGameState] = useState<GameState | null>(null);

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


	return (
		<div className="flex flex-col md:flex-row h-full gap-5 bg-[#333333] p-3">
			<div className="flex-1 min-w-0 flex justify-center">
				<div className=" p-2 rounded flex flex-col gap-2 max-h-[90vh]">
					<CapturedPiecesWidget
						capturedPieces={topPlayerCapturedPieces}
						color={bottomPlayerColor}
						name={topPlayer}
						material={topPlayerMaterialUpBy !== 0 ? topPlayerMaterialUpBy : ""}
					/>

					<div className="aspect-square max-h-[74vh] w-auto max-w-[76vh]">
						<BoardWidget
							gameId={gameId}
							gameState={gameState}
							isWhiteView={isWhiteView}
						/>
					</div>

					<CapturedPiecesWidget
						capturedPieces={bottomPlayerCapturedPieces}
						color={topPlayerColor}
						name={bottomPlayer}
						material={bottomPlayerMaterialUpBy !== 0 ? bottomPlayerMaterialUpBy : ""}
					/>
				</div>
			</div>

			<div className="lg:w-110 md:w-90 w-full min-w-75 shrink-0 h-fit md:h-full bg-[#333333] overflow-hidden">
				<div className="w-full h-full bg-[#222222] rounded-md flex flex-col">
					<div className="flex gap-3 items-center p-5">
						<div className="size-6 rounded" style={{ backgroundColor: turn.toLocaleLowerCase() }}></div>
						<div className="text-2xl text-white font-bold">{turn} to Move</div>
					</div>
					<Separator className="border-zinc-700 border" />
					<div className="overflow-hidden rounded-md">
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
				</div>
			</div>
		</div>
	)
}
export default GamePageWidget