"use client"

import BoardWidget from "@/components/board/BoardWidget";
import DetailsSidebar from "@/components/detailsBar/DetailsBar";
import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
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

			<div className="lg:w-110 md:w-90 w-full min-w-75 shrink-0 md:h-full bg-[#333333]">
				<DetailsSidebar
					turn={turn}
					gameState={gameState}
				/>
			</div>
		</div>
	)
}
export default GamePageWidget

