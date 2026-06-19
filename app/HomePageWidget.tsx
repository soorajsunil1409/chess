"use client";

import PieceWidget from "@/components/Piece";
import { DARK_CELL, LIGHT_CELL, SELECTED_DARK_CELL, SELECTED_LIGHT_CELL } from "@/lib/constants";
import { ICell } from "@/types/chessTypes";
import { Square } from "chess.js";
import { useState } from "react";

const HomePageWidget = ({ board }: {
	board: (ICell | null)[][]
}) => {
	const [isWhiteView, setIsWhiteView] = useState<boolean>(true);
	const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

	const boardAligned = !isWhiteView
		? board.map(row => row.toReversed()).reverse()
		: board;

	const rowLabels = isWhiteView
		? [8, 7, 6, 5, 4, 3, 2, 1]
		: [1, 2, 3, 4, 5, 6, 7, 8];

	const colLabels = isWhiteView
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];

	const handlePieceClick = (square: Square) => {
		setSelectedSquare((prev) => prev == null || prev !== square ? square : null)
	}

	return (
		<div className="w-full h-full bg-red-400 p-10 flex justify-center">
			<div className="flex-1 h-full bg-gray-400"></div>
			<div className="size-[min(90vw,90vh)] aspect-square flex flex-col">
				{
					boardAligned.map((row, rowIndex: number) => {
						return (
							<div key={rowIndex} className="w-full h-full flex">
								{
									row.map((cell, colIndex: number) => {
										const isWhiteCellFirst = rowIndex % 2 != 0;
										let cellColor;
										let cellColorOpp;
										let highlightColor;

										if (isWhiteCellFirst) {
											cellColor = colIndex % 2 == 0 ? DARK_CELL : LIGHT_CELL;
										} else {
											cellColor = colIndex % 2 == 0 ? LIGHT_CELL : DARK_CELL;
										}

										cellColorOpp = cellColor == DARK_CELL ? LIGHT_CELL : DARK_CELL;
										highlightColor = cellColor == DARK_CELL ? SELECTED_DARK_CELL : SELECTED_LIGHT_CELL;

										return (
											<div
												key={colIndex}
												className={`relative ${cell && "cursor-grab"} w-full h-full flex items-center justify-center`}
												style={{
													containerType: "size",
													backgroundColor: (cell?.square === selectedSquare) ? highlightColor : cellColor
												}}
												onClick={() => {
													if (cell) {
														handlePieceClick(cell?.square);
													}
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