"use client";

import PieceWidget from "@/components/Piece";
import { DARK_CELL, LEGAL_HIGHLIGHT, LIGHT_CELL, SELECTED_DARK_CELL, SELECTED_LIGHT_CELL } from "@/lib/constants";
import { Chess, Move, Square } from "chess.js";
import { useMemo, useRef, useState } from "react";

const HomePageWidget = () => {
	const [isWhiteView, setIsWhiteView] = useState<boolean>(true);
	const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
	const [destinationSquare, setDestinationSquare] = useState<Square | null>(null);

	// const [selectedLegalMoves, setSelectedLegalMoves] = useState<Square[] | null>(null);

	const chessRef = useRef(new Chess());
	const [board, setBoard] = useState(chessRef.current.board());

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

	const handlePieceClick = (square: Square) => {
		const piece = chessRef.current.get(square);

		// Move and Captures
		if (
			selectedSquare &&
			selectedLegalSquares.includes(square)
		) {
			const move = chessRef.current.move({
				from: selectedSquare,
				to: square,
				promotion: "q"
			})

			setBoard(chessRef.current.board());
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

	return (
		<div className="w-full h-full p-10 flex justify-center">
			<div className="flex-1 h-full bg-gray-400"></div>
			<div className="size-[min(90vw,90vh)] aspect-square flex flex-col">
				{
					boardAligned.map((row, rowIndex: number) => {
						return (
							<div key={rowIndex} className="w-full h-full flex">
								{
									row.map((cell, colIndex: number) => {
										const isDark = (rowIndex + colIndex) % 2 === 1;

										const cellColor = isDark ? DARK_CELL : LIGHT_CELL;
										const cellColorOpp = cellColor == DARK_CELL ? LIGHT_CELL : DARK_CELL;
										const highlightColor = cellColor == DARK_CELL ? SELECTED_DARK_CELL : SELECTED_LIGHT_CELL;

										const square: Square = `${colLabels[colIndex]}${rowLabels[rowIndex]}` as Square;

										return (
											<div
												key={colIndex}
												className={`relative ${(cell || selectedLegalSquares.includes(square)) ? "cursor-grab" : ""} w-full h-full flex items-center justify-center`}
												style={{
													containerType: "size",
													backgroundColor: (square === selectedSquare) ? highlightColor : cellColor
												}}
												onClick={() => {
													handlePieceClick(square);
												}}
											>
												<span
													className="absolute font-bold top-0 left-1"
													style={{
														fontSize: "20cqw",
														color: cellColorOpp
													}}
												>
													{colIndex === 0 && rowLabels[rowIndex]}
												</span>

												<span
													className="absolute font-bold bottom-0 right-1"
													style={{
														fontSize: "20cqw",
														color: cellColorOpp
													}}
												>
													{rowIndex == 7 && colLabels[colIndex]}
												</span>
												<div className="absolute inset-0 size-full flex justify-center items-center">
													{
														selectedLegalSquares?.includes(square) && !selectedCapturableSquares.includes(square) &&
														<span
															className="size-1/3 rounded-full"
															style={{
																backgroundColor: LEGAL_HIGHLIGHT
															}}
														/>
													}

													{
														selectedCapturableSquares.includes(square) &&
														<span
															className="size-full rounded-full"
															style={{
																backgroundColor: LEGAL_HIGHLIGHT
															}}
														/>
													}

												</div>

												{
													cell &&
													<PieceWidget type={cell?.type} color={cell?.color} />
												}
											</div>
										)
									})
								}
							</div>
						)
					})
				}
			</div>
			<div className="flex-1 h-full bg-gray-400">
				<button onClick={() => setIsWhiteView((prev) => !prev)}>Flip</button>
			</div>
		</div>
	)
}
export default HomePageWidget