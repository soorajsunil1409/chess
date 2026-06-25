import { CHECK_HIGHLIGHT_COLOR, DARK_CELL, LIGHT_CELL, SELECTED_DARK_CELL, SELECTED_LIGHT_CELL } from "@/lib/constants";
import { GameState } from "@/lib/socket/stores/games";
import { Color, PieceSymbol, Square } from "chess.js";
import { BoardCell } from "./BoardCell";

type TBoardRow = {
	rowIndex: number,
	row: ({
		square: Square;
		type: PieceSymbol;
		color: Color;
	} | null)[],
	gameState: GameState,
	selectedSquare: string | null,
	isWhiteView: boolean,
	turn: string,
	selectedLegalSquares: Square[],
	handlePieceClick: (square: Square) => void,
	selectedCapturableSquares: Square[]
}

export const BoardRow = ({ rowIndex,
	row,
	selectedSquare,
	isWhiteView,
	gameState,
	turn,
	selectedLegalSquares,
	handlePieceClick,
	selectedCapturableSquares
}: TBoardRow) => {
	const rowLabels = isWhiteView
		? [8, 7, 6, 5, 4, 3, 2, 1]
		: [1, 2, 3, 4, 5, 6, 7, 8];

	const colLabels = isWhiteView
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];

	const lastMove = gameState.lastMove;
	const status = gameState.status;

	return (
		<div key={rowIndex} className="flex flex-1">
			{
				row.map((cell, colIndex) => {
					const isDark = (rowIndex + colIndex) % 2 === 1;

					const cellColor = isDark ? DARK_CELL : LIGHT_CELL;
					const cellColorOpp = isDark ? LIGHT_CELL : DARK_CELL;
					const highlightColor = isDark
						? SELECTED_DARK_CELL
						: SELECTED_LIGHT_CELL;

					const square = `${colLabels[colIndex]}${rowLabels[rowIndex]}` as Square;

					let squareColor = square === selectedSquare ||
						lastMove?.to === square ||
						lastMove?.from === square
						? highlightColor
						: cellColor;

					if (cell?.type === "k" &&
						cell.color === turn &&
						status?.isCheck) {
						squareColor = CHECK_HIGHLIGHT_COLOR;
					}

					return (
						<BoardCell
							key={square}
							square={square}
							cell={cell}
							squareColor={squareColor}
							colIndex={colIndex}
							rowIndex={rowIndex}
							colLabels={colLabels}
							rowLabels={rowLabels}
							cellColorOpp={cellColorOpp}
							selectedLegalSquares={selectedLegalSquares}
							selectedCapturableSquares={selectedCapturableSquares}
							handlePieceClick={handlePieceClick}
						/>
					);
				})}
		</div>
	);
}
