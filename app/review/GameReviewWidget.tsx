"use client";

import BoardPlayspace from "@/components/board/BoardPlayspace";
import CapturedPiecesWidget from "@/components/CapturedPiecesWidget";
import DetailsSidebar from "@/components/detailsBar/DetailsBar";
import { convertGameToGameState, getDynamicGameState } from "@/lib/chess";
import { GameState } from "@/lib/socket/stores/games";
import { Chess, Move, PieceSymbol, Square } from "chess.js";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react"

const GameReviewWidget = ({ gameId }: { gameId: string }) => {
	const { data: session } = useSession();
	const [gameState, setGameState] = useState<GameState>();
	const [gameHistory, setGameHistory] = useState<Move[]>([]);
	const [boardChess, setBoardChess] = useState(() => new Chess());
	const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
	const [positions, setPositions] = useState<Chess[]>(); // TODO optimize positions

	const masterChessRef = useRef(new Chess());
	const masterGameState = useRef<GameState | null>(null);

	const handlePieceClick = (square: Square) => {
		return;
	}

	const goToMove = (moveIdx: number) => {
		const chess = new Chess();

		for (let i = 0; i < moveIdx; i++) {
			chess.move(gameHistory[i]);
		}

		setGameState(prev => {
			if (!prev) return prev;

			return {
				...prev,
				...getDynamicGameState(chess),
			};
		});

		setBoardChess(chess);
	};

	const handleNextMove = () => {
		if (currentMoveIndex >= gameHistory.length) return;

		setCurrentMoveIndex(prev => prev + 1);
	};

	const handlePreviousMove = () => {
		if (currentMoveIndex <= 0) return;

		setCurrentMoveIndex(prev => prev - 1);
	};

	useEffect(() => {
		goToMove(currentMoveIndex);
	}, [currentMoveIndex, gameHistory]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			e.preventDefault();
			if (e.key === "ArrowLeft") {
				handlePreviousMove();
			}

			if (e.key === "ArrowRight") {
				handleNextMove();
			}

			if (e.key === "ArrowUp") {
				setCurrentMoveIndex(gameHistory.length);
			}

			if (e.key === "ArrowDown") {
				setCurrentMoveIndex(0);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentMoveIndex, gameHistory.length]);

	useEffect(() => {
		const handleFetchGame = async () => {
			const res = await fetch(`/api/games/${gameId}`);

			const { game } = await res.json();

			const masterChess = new Chess();
			masterChess.loadPgn(game.pgn);
			const gs = convertGameToGameState(game, masterChess);
			masterChessRef.current = masterChess;
			masterGameState.current = gs

			const chess = new Chess();
			chess.loadPgn(game.pgn);

			const history = chess.history({ verbose: true })
			setBoardChess(chess);
			setGameState(gs);

			setCurrentMoveIndex(history.length)
			setGameHistory(history);
		}

		handleFetchGame();
	}, [gameId]);


	if (!masterGameState.current || !gameState || !session) {
		return <div>Loading...</div>;
	}

	const master = masterGameState.current;

	const isWhiteView = !session ? true : master.whitePlayerId === session.user?.id
	const topPlayerColor = isWhiteView ? "b" : "w";
	const bottomPlayerColor = isWhiteView ? "w" : "b";
	const topPlayer = isWhiteView ? master.blackPlayerUsername : master.whitePlayerUsername;
	const bottomPlayer = isWhiteView ? master.whitePlayerUsername : master.blackPlayerUsername;
	const topPlayerCapturedPieces: PieceSymbol[] = isWhiteView ? gameState.blacksCapturedPieces : gameState.whitesCapturedPieces;
	const bottomPlayerCapturedPieces: PieceSymbol[] = isWhiteView ? gameState.whitesCapturedPieces : gameState.blacksCapturedPieces;

	const advantage = gameState.material.advantage;

	const topPlayerMaterialUpBy =
		isWhiteView
			? advantage < 0 ? -advantage : 0
			: advantage > 0 ? advantage : 0;

	const bottomPlayerMaterialUpBy =
		isWhiteView
			? advantage > 0 ? advantage : 0
			: advantage < 0 ? -advantage : 0;

	const board = boardChess.board();
	const boardAligned = !isWhiteView
		? board.map(row => row.toReversed()).reverse()
		: board;

	const selectedSquare = null;

	const turn = gameState.turn === "w" ? "White" : "Black";

	const selectedLegalSquares: Square[] = [];
	const selectedCapturableSquares: Square[] = [];

	// console.log(gameState);

	return (
		<div className="flex flex-col md:flex-row h-auto md:h-[90vh] gap-5 bg-[#333333] p-3">
			<div className="flex-1 flex justify-center min-w-0">
				<div className="flex flex-col gap-2 w-[min(76vh,95vw)]">
					<CapturedPiecesWidget
						capturedPieces={topPlayerCapturedPieces}
						color={bottomPlayerColor}
						name={topPlayer}
						material={topPlayerMaterialUpBy !== 0 ? topPlayerMaterialUpBy : ""}
					/>

					<div className="flex justify-center">
						<BoardPlayspace
							gameState={gameState}
							boardAligned={boardAligned}
							isWhiteView={isWhiteView}
							selectedSquare={selectedSquare}
							turn={gameState.turn}
							selectedLegalSquares={selectedLegalSquares}
							selectedCapturableSquares={selectedCapturableSquares}
							handlePieceClick={handlePieceClick}
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

			<div className="w-full md:w-90 lg:w-110 md:min-w-90 shrink-0 flex md:flex-col flex-col-reverse gap-3 md:h-[90%]">
				<DetailsSidebar
					turn={turn}
					gameState={masterGameState.current}
					isReview={true}
					handleMoveClick={setCurrentMoveIndex}
				/>
				<div className="flex gap-3 w-full justify-center p-3 bg-[#222222] rounded-md">
					<button
						onClick={handlePreviousMove}
						className="w-full cursor-pointer rounded-md border border-[#222222] bg-linear-to-t from-[#2d2d2d] to-[#464646] p-3 font-bold text-white shadow-md"
					>
						Previous
					</button>
					<button
						onClick={handleNextMove}
						className="w-full cursor-pointer rounded-md border border-[#222222] bg-linear-to-t from-[#2d2d2d] to-[#464646] p-3 font-bold text-white shadow-md"
					>
						Next
					</button>
				</div>
			</div>

		</div>
	)
}
export default GameReviewWidget