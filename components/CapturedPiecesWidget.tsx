import { BLACK, Color, PieceSymbol, WHITE } from "chess.js"
import { User2 } from "lucide-react"

const CapturedPiecesWidget = ({ capturedPieces, color, name, material }: { capturedPieces: PieceSymbol[], color: Color, name: string, material: number | "" }) => {
	const pieceOrder: Record<PieceSymbol, number> = {
		p: 0,
		n: 1,
		b: 2,
		r: 3,
		q: 4,
		k: 5,
	};

	const groupedPieces = Object.entries(
		capturedPieces.reduce((acc, piece) => {
			acc[piece] ??= [];
			acc[piece].push(piece);
			return acc;
		}, {} as Record<PieceSymbol, PieceSymbol[]>)
	).sort(
		([a], [b]) => pieceOrder[a as PieceSymbol] - pieceOrder[b as PieceSymbol]
	);

	return (
		<div className="h-12 md:h-14 w-full flex items-center gap-3 p-1">
			<User2
				fill="#222222"
				strokeWidth={0}
				className="h-full w-auto aspect-square rounded-md bg-[#555555] p-1"
			/>
			<div className="flex flex-col text-white justify-start w-full h-full">
				<div className="font-bold h-1/2 leading-none flex gap-2 items-center">
					<div>{name}</div>
					<div
						className="size-4 rounded-full"
						style={{
							backgroundColor: color == BLACK ? "white" : "black"
						}} />
				</div>
				<div className="flex gap-1 items-center text-sm">
					<div className="flex items-center">
						{groupedPieces.map(([type, pieces]) => (
							<div
								key={type}
								className="relative h-5"
								style={{
									width: `${20 + (pieces.length - 1) * 8}px`,
								}}
							>
								{
									pieces.map((piece, index) => {
										const piecePath = `/assets/pieces/${color}/${piece}-${color}.svg`;

										return (
											<img
												key={index}
												src={piecePath}
												alt={piece}
												draggable={false}
												loading="eager"
												className="absolute -top-px size-5"
												style={{
													left: `${index * 8}px`,
													zIndex: index,
												}}
											/>
										);
									})
								}
							</div>
						))}
					</div>
					<div className="text-gray-400">
						{
							material !== "" ?
							`+${material}` : ""
						}
						
					</div>
				</div>
			</div>
		</div>
	)
}
export default CapturedPiecesWidget