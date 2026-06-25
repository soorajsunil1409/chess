import { LEGAL_HIGHLIGHT } from "@/lib/constants";
import { Color, PieceSymbol, Square } from "chess.js";
import PieceWidget from "../PieceWidget";

type TBoardCell = {
	square: Square,
	cell: {
		square: Square;
		type: PieceSymbol;
		color: Color;
	} | null,
	selectedLegalSquares: Square[],
	squareColor: string,
	handlePieceClick: (square: Square) => void,
	colIndex: number,
	cellColorOpp: string,
	rowLabels: number[],
	rowIndex: number,
	colLabels: string[],
	selectedCapturableSquares: Square[]
}

export const BoardCell = ({
	square,
	cell,
	selectedLegalSquares,
	squareColor,
	handlePieceClick,
	colIndex,
	cellColorOpp,
	rowLabels,
	rowIndex,
	colLabels,
	selectedCapturableSquares
}: TBoardCell) => {
	return (
		<div
			key={square}
			className={`relative flex flex-1 items-center justify-center select-none ${cell || selectedLegalSquares.includes(square)
				? "cursor-grab"
				: ""}`}
			style={{ backgroundColor: squareColor }}
			onClick={() => handlePieceClick(square)}
		>
			{colIndex === 0 && (
				<span
					className="absolute top-0 left-1 text-[8px] font-bold md:text-xs"
					style={{ color: cellColorOpp }}
				>
					{rowLabels[rowIndex]}
				</span>
			)}

			{rowIndex === 7 && (
				<span
					className="absolute right-1 bottom-0 text-[8px] font-bold md:text-xs"
					style={{ color: cellColorOpp }}
				>
					{colLabels[colIndex]}
				</span>
			)}

			<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
				{selectedLegalSquares.includes(square) &&
					!selectedCapturableSquares.includes(square) && (
						<span
							className="h-1/3 w-1/3 rounded-full"
							style={{
								backgroundColor: LEGAL_HIGHLIGHT,
							}} />
					)}

				{selectedCapturableSquares.includes(square) && (
					<span
						className="absolute inset-0 rounded-full border-[6px]"
						style={{
							borderColor: LEGAL_HIGHLIGHT,
						}} />
				)}
			</div>

			{cell && (
				<PieceWidget
					type={cell.type}
					color={cell.color} />
			)}
		</div>
	);
}

