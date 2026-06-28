import { GameState } from "@/lib/socket/stores/games";
import { BoardRow } from "./BoardRow";
import { Color, PieceSymbol, Square } from "chess.js";

type BoardPlayspaceProps = {
	gameState: GameState;
	boardAligned: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
	isWhiteView: boolean;
	selectedSquare: Square | null;
	turn: string;
	selectedLegalSquares: Square[];
	selectedCapturableSquares: Square[];
	handlePieceClick: (square: Square) => void;
};

const BoardPlayspace = ({
	gameState,
	boardAligned,
	isWhiteView,
	selectedSquare,
	turn,
	selectedLegalSquares,
	selectedCapturableSquares,
	handlePieceClick,
}: BoardPlayspaceProps) => {
	const messages = new Map([
		["", ""],
		["draw", "by agreement"],
		["stalemate", "by stalemate"],
		["checkmate", "by checkmate"],
		["resignation", "by resignation"],
		["threefold", "by threefold repetition"],
		["insufficient", "by insufficient materials"]
	]);

	return (
		<div className="relative aspect-square w-full max-w-[76vh]">
			{gameState.status.isGameOver && (
				<div className="absolute inset-0 z-50 flex items-center justify-center">
					<div className="w-100 overflow-hidden rounded-lg bg-[#3a3a3a] shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),0_6.7px_5.3px_rgba(0,0,0,0.048),0_12.5px_10px_rgba(0,0,0,0.06),0_22.3px_17.9px_rgba(0,0,0,0.072),0_41.8px_33.4px_rgba(0,0,0,0.086),0_100px_80px_rgba(0,0,0,0.12)]">
						<div className="flex flex-col p-3 text-center text-white">
							<div className="text-2xl font-bold">
								{gameState.winner === "draw" ? "Game drawn" : gameState.winner === "w"
									? "White won"
									: "Black won"}
							</div>

							<div className="text-md">
								{messages.get(gameState.result)}
							</div>
						</div>

						<div className="flex justify-center bg-[#222] p-5 text-xl font-bold text-white">
							<button className="w-full cursor-pointer rounded-2xl border border-x-[#78a52f] border-t-[#a9ce6d] border-b-[#5c8943] bg-linear-to-t from-[#658f4e] to-[#a9ce6d] px-5 py-2">
								Go to Lobby
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="flex h-full flex-col overflow-hidden rounded-sm">
				{boardAligned.map((row, rowIndex) => (
					<BoardRow
						key={rowIndex}
						row={row}
						rowIndex={rowIndex}
						isWhiteView={isWhiteView}
						selectedSquare={selectedSquare}
						turn={turn}
						gameState={gameState}
						selectedLegalSquares={selectedLegalSquares}
						selectedCapturableSquares={
							selectedCapturableSquares
						}
						handlePieceClick={handlePieceClick}
					/>
				))}
			</div>
		</div>
	);
};

export default BoardPlayspace;