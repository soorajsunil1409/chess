import { Color, PieceSymbol } from "chess.js";
import { ChessBishop, ChessKing, ChessKnight, ChessPawn, ChessQueen, ChessRook } from "lucide-react";
import Image from "next/image";

const PieceWidget = ({
	type, color
}: {
	type: PieceSymbol;
	color: Color;
}) => {
	const piecePath = `/assets/pieces/${color}/${type}-${color}.svg`;
	
	return (
		<div className="w-full h-full">
			<Image src={piecePath} width={100} height={100} alt={type} draggable={false} />
		</div>
	)
}
export default PieceWidget