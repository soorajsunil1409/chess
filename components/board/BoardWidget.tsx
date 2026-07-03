import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameState } from "@/lib/socket/stores/games";
import { socket } from "@/lib/socket/socket";
import CapturedPiecesWidget from "../CapturedPiecesWidget";
import BoardPlayspace from "./BoardPlayspace";
import { gameMove } from "@/lib/game/gameMove";
import { toast } from "sonner";

const BoardWidget = ({
	gameState,
	gameId,
	isWhiteView,
	topPlayer,
	bottomPlayer,
	topPlayerCapturedPieces,
	bottomPlayerCapturedPieces,
	topPlayerColor,
	bottomPlayerColor,
	topPlayerMaterialUpBy,
	bottomPlayerMaterialUpBy
}: {
	gameState: GameState,
	gameId: string,
	isWhiteView: boolean,
	topPlayer: string,
	bottomPlayer: string,
	topPlayerCapturedPieces: PieceSymbol[],
	bottomPlayerCapturedPieces: PieceSymbol[],
	topPlayerColor: Color,
	bottomPlayerColor: Color,
	topPlayerMaterialUpBy: number,
	bottomPlayerMaterialUpBy: number
}) => {
	const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const chessRef = useRef(new Chess());
	const [board, setBoard] = useState(chessRef.current.board());

	const turn = gameState.turn;

	useEffect(() => {
		chessRef.current.load(gameState.fen);

		setBoard(
			chessRef.current.board()
		);
		setIsSubmitting(false);
		setSelectedSquare(null);
	}, [gameState.fen]);

	const boardAligned = !isWhiteView
		? board.map(row => row.toReversed()).reverse()
		: board;

	const selectedLegalMoves: Move[] = useMemo(() => {
		if (!selectedSquare) return [];

		const legalMoves = chessRef.current.moves({ square: selectedSquare, verbose: true });
		return legalMoves;

	}, [selectedSquare])

	const selectedLegalSquares = selectedLegalMoves.map((move) => move.to);
	const selectedCapturableSquares = selectedLegalMoves.filter((move) => move.captured !== undefined).map((move) => move.to)

	const handlePieceClick = async (square: Square) => {
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
			const res = await gameMove(gameId, selectedSquare, square, "q");
			setSelectedSquare(null);

			if (!res.success) {
				toast.error(res.error);
				return;
			}

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
		<div className="flex flex-col gap-2 w-[min(76vh,95vw)]">
			<CapturedPiecesWidget
				capturedPieces={topPlayerCapturedPieces}
				color={bottomPlayerColor}
				name={topPlayer}
				material={topPlayerMaterialUpBy !== 0 ? topPlayerMaterialUpBy : ""}
			/>

			<BoardPlayspace
				gameState={gameState}
				boardAligned={boardAligned}
				isWhiteView={isWhiteView}
				selectedSquare={selectedSquare}
				turn={turn}
				selectedLegalSquares={selectedLegalSquares}
				selectedCapturableSquares={selectedCapturableSquares}
				handlePieceClick={handlePieceClick}
			/>
			
			<CapturedPiecesWidget
				capturedPieces={bottomPlayerCapturedPieces}
				color={topPlayerColor}
				name={bottomPlayer}
				material={bottomPlayerMaterialUpBy !== 0 ? bottomPlayerMaterialUpBy : ""}
			/>
		</div>
	)
}
export default BoardWidget
