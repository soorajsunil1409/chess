"use client"

import BoardWidget from "@/components/board/BoardWidget";
import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

const GamePageWidget = ({ gameId }: { gameId: string }) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [gameState, setGameState] = useState<GameState | null>(null);

	useEffect(() => {
		const handleGetGameState = (gameState: GameState) => {
			setGameState(gameState);
			console.log(gameState);
		}

		const handleGameError = (error: string) => {
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

		socket.emit("game:join", gameId);

		return () => {
			socket.off("game:state", handleGetGameState);
			socket.off("game:error", handleGameError);
		}
	}, [gameId]);

	// const board = 

	return (
		<div className="flex justify-center bg-[#444444] h-full">
			{/* {session?.user?.id === gameState?.whitePlayerId ? gameState?.whitePlayerUsername : gameState?.blackPlayerUsername} */}
			{gameState && (
				<BoardWidget
					gameState={gameState}
				/>
			)}
		</div>
	)
}
export default GamePageWidget