import { Color, PieceSymbol, Square } from "chess.js"

export type ICell = {
	square: Square;
	color: Color;
	type: PieceSymbol;
}