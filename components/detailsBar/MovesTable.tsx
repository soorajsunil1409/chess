type MovesTableProps = {
	formattedHistory: {
		moveNumber: number;
		white: string;
		black: string;
	}[];
	handleMoveClick?: (moveIdx: number) => void;
};

const MovesTable = ({
	formattedHistory,
	handleMoveClick
}: MovesTableProps) => {
	const handleClick = (moveIdx: number) => {
		if (handleMoveClick !== undefined)
			handleMoveClick(moveIdx);
	}

	return (
		<table className="w-full text-sm text-zinc-300">
			<thead>
				<tr className="bg-[#2a2a2a] text-zinc-100">
					<th className="w-12 px-3 py-2 text-left">#</th>
					<th className="px-3 py-2 text-left">White</th>
					<th className="px-3 py-2 text-left">Black</th>
				</tr>
			</thead>

			<tbody>
				{formattedHistory.map((move) => (
					<tr
						key={move.moveNumber}
						className={
							move.moveNumber % 2 === 0
								? "bg-[#2a2a2a]"
								: "bg-[#222222]"
						}
					>
						<td className="px-3 py-2 font-bold">
							{move.moveNumber}.
						</td>

						<td
							onClick={() => handleClick(2 * move.moveNumber - 1)}
							className="px-3 py-2 font-semibold cursor-pointer hover:underline"
						>
							{move.white}
						</td>

						<td
							onClick={() => handleClick(2 * move.moveNumber)}
							className="px-3 py-2 font-semibold cursor-pointer hover:underline"
						>
							{move.black}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default MovesTable;