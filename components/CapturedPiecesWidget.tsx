import { BLACK, Color, PieceSymbol, WHITE } from "chess.js"
import { User2 } from "lucide-react"
import PieceWidget from "./Piece"

const CapturedPiecesWidget = ({ capturedPieces, color, name }: { capturedPieces: PieceSymbol[], color: Color, name: string }) => {
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
				<div className="text-xs text-gray-300 h-1/2 flex justify-start w-fit">
					{
						capturedPieces.map((piece, index: number) => (
							<PieceWidget key={index} type={piece} color={color} />
						))
					}
				</div>
			</div>
		</div>
	)
}
export default CapturedPiecesWidget