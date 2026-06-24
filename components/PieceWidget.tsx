import { Color, PieceSymbol } from "chess.js";

const PieceWidget = ({
	type, color
}: {
	type: PieceSymbol;
	color: Color;
}) => {
	const piecePath = `/assets/pieces/${color}/${type}-${color}.svg`;

	return (
		<div className="w-full h-full select-none">
			<img src={piecePath} alt={type} draggable={false}
				loading="eager" className="size-full" />
		</div>
	)
}
export default PieceWidget