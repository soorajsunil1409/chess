"use client"

import BoardWidget from "@/components/board/BoardWidget";
import { socket } from "@/lib/socket";
import { GameState } from "@/lib/socket/stores/games";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

const GamePageWidget = ({ gameId }: { gameId: string }) => {
	const router = useRouter();
	const [gameState, setGameState] = useState<GameState | null>(null);

	useEffect(() => {
		const handleGetGameState = (gameState: GameState) => {
			setGameState(gameState);
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

		// if (socket.connected)
		socket.emit("game:join", gameId);

		return () => {
			socket.off("game:state", handleGetGameState);
			socket.off("game:error", handleGameError);
		}
	}, [gameId]);

	useEffect(() => {
		const handleGameUpdate = (
			data: {
				fen: string;
				lastMove: any;
				turn: any;
				status: any;
			}
		) => {
			setGameState(prev => {
				if (!prev) return prev;

				return {
					...prev,
					fen: data.fen,
					lastMove: data.lastMove,
					turn: data.turn,
					status: data.status,
				};
			});
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

	return (
		<div className="flex flex-col lg:flex-row justify-center items-center bg-[#444444] min-h-screen gap-5">
			<div className="hidden lg:flex w-64"></div>

			{gameState && (
				<BoardWidget
					gameId={gameId}
					gameState={gameState}
				/>
			)}

			<div className="bg-[#333333] rounded-r flex-1 w-full lg:h-screen">
				sdfsd
			</div>
		</div>
	)
}
export default GamePageWidget