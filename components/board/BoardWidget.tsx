import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import CapturedPiecesWidget from "../CapturedPiecesWidget";
import PieceWidget from "../Piece";
import { CHECK_HIGHLIGHT_COLOR, DARK_CELL, LEGAL_HIGHLIGHT, LIGHT_CELL, SELECTED_DARK_CELL, SELECTED_LIGHT_CELL } from "@/lib/constants";
import { GameState } from "@/lib/socket/stores/games";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

const BoardWidget = ({ gameState, gameId }: { gameState: GameState, gameId: string }) => {
	const { data: session } = useSession();

	const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
	const [whitesCapturedPieces, setWhitesCapturedPieces] = useState<PieceSymbol[] | []>([]);
	const [blacksCapturedPieces, setBlacksCapturedPieces] = useState<PieceSymbol[] | []>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const chessRef = useRef(new Chess());
	const [board, setBoard] = useState(chessRef.current.board());

	const lastMove = gameState.lastMove;
	const turn = gameState.turn;
	const status = gameState.status;

	useEffect(() => {
		chessRef.current.load(gameState.fen);

		setBoard(
			chessRef.current.board()
		);
		setIsSubmitting(false);
		setSelectedSquare(null);
	}, [gameState.fen]);

	const isWhiteView = gameState.whitePlayerId === session?.user?.id;

	const boardAligned = !isWhiteView
		? board.map(row => row.toReversed()).reverse()
		: board;

	const rowLabels = isWhiteView
		? [8, 7, 6, 5, 4, 3, 2, 1]
		: [1, 2, 3, 4, 5, 6, 7, 8];

	const colLabels = isWhiteView
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];


	const selectedLegalMoves: Move[] = useMemo(() => {
		if (!selectedSquare) return [];

		const legalMoves = chessRef.current.moves({ square: selectedSquare, verbose: true });
		return legalMoves;

	}, [selectedSquare])

	const selectedLegalSquares = selectedLegalMoves.map((move) => move.to);
	const selectedCapturableSquares = selectedLegalMoves.filter((move) => move.captured !== undefined).map((move) => move.to)

	const bottomCapturedPieces = isWhiteView ? whitesCapturedPieces : blacksCapturedPieces;
	const topCapturedPieces = isWhiteView ? blacksCapturedPieces : whitesCapturedPieces;

	const handlePieceClick = (square: Square) => {
		if (isSubmitting) return;
		const piece = chessRef.current.get(square);

		if ((turn || chessRef.current.turn()) !== (isWhiteView ? "w" : "b")) {
			return;
		}

		// Move and Captures
		if (
			selectedSquare &&
			selectedLegalSquares.includes(square)
		) {
			setIsSubmitting(true);

			socket.emit("game:move", {
				gameId: gameId,
				from: selectedSquare,
				to: square,
				promotion: "q"
			})

			setSelectedSquare(null);

			return;
		}

		// Empty square
		if (!piece) {
			setSelectedSquare(null);
			return;
		}

		// Dont select opponent piece
		if (piece.color !== chessRef.current.turn()) {
			return;
		}

		setSelectedSquare((prev) => prev === square ? null : square);
	}

	const topPlayer = isWhiteView ? gameState.blackPlayerUsername : gameState.whitePlayerUsername;
	const bottomPlayer = isWhiteView ? gameState.whitePlayerUsername : gameState.blackPlayerUsername;

	return (
		<div className="bg-[#333333] p-2 rounded flex flex-col gap-2 shadow-2xl h-full w-fit justify-center">
			<CapturedPiecesWidget capturedPieces={topCapturedPieces} color={isWhiteView ? "w" : "b"} name={topPlayer} />

			<div className=" max-size-full size-[min(92vw,71vh)] aspect-square flex flex-col">
				{
					boardAligned.map((row, rowIndex) => (
						<div key={rowIndex} className="flex-1 flex">
							{
								row.map((cell, colIndex) => {
									const isDark = (rowIndex + colIndex) % 2 === 1;

									const cellColor = isDark
										? DARK_CELL
										: LIGHT_CELL;

									const cellColorOpp = isDark
										? LIGHT_CELL
										: DARK_CELL;

									const highlightColor = isDark
										? SELECTED_DARK_CELL
										: SELECTED_LIGHT_CELL;

									const square =
										`${colLabels[colIndex]}${rowLabels[rowIndex]}` as Square;

									let squareColor = square === selectedSquare || (lastMove?.to == square || lastMove?.from == square)
										? highlightColor
										: cellColor

									if (cell?.type === "k" && cell.color === turn && status?.isCheck) squareColor = CHECK_HIGHLIGHT_COLOR;

									return (
										<div
											key={square}
											className={`relative select-none flex-1 flex items-center justify-center ${(cell || selectedLegalSquares.includes(square))
												? "cursor-grab"
												: ""
												}`}
											style={{
												backgroundColor: squareColor
											}}
											onClick={() => handlePieceClick(square)}
										>
											{/* Rank labels */}
											{
												colIndex === 0 &&
												<span
													className="absolute top-0 left-1 font-bold text-[8px] md:text-xs"
													style={{
														color: cellColorOpp
													}}
												>
													{rowLabels[rowIndex]}
												</span>
											}

											{/* File labels */}
											{
												rowIndex === 7 &&
												<span
													className="absolute bottom-0 right-1 font-bold text-[8px] md:text-xs"
													style={{
														color: cellColorOpp
													}}
												>
													{colLabels[colIndex]}
												</span>
											}

											{/* Legal move indicators */}
											<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
												{
													selectedLegalSquares.includes(square) &&
													!selectedCapturableSquares.includes(square) &&
													(
														<span
															className="w-1/3 h-1/3 rounded-full"
															style={{
																backgroundColor: LEGAL_HIGHLIGHT
															}}
														/>
													)
												}

												{
													selectedCapturableSquares.includes(square) &&
													(
														<span
															className="absolute inset-0 rounded-full border-[6px]"
															style={{
																borderColor: LEGAL_HIGHLIGHT
															}}
														/>
													)
												}
											</div>

											{
												cell &&
												<PieceWidget
													type={cell.type}
													color={cell.color}
												/>
											}
										</div>
									);
								})
							}
						</div>
					))
				}
			</div>

			{/* White Player */}
			<CapturedPiecesWidget capturedPieces={bottomCapturedPieces} color={isWhiteView ? "b" : "w"} name={bottomPlayer} />

			<button
				// onClick={() => setIsWhiteView(prev => !prev)}
				className="bg-gray-600 text-white px-3 py-2 rounded"
			>
				Flip
			</button>
		</div>
	)
}
export default BoardWidget