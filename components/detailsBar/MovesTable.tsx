type MovesTableProps = {
	formattedHistory: {
		moveNumber: number;
		white: string;
		black: string;
	}[];
};

const MovesTable = ({
	formattedHistory,
}: MovesTableProps) => {
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

						<td className="px-3 py-2 font-semibold">
							{move.white}
						</td>

						<td className="px-3 py-2 font-semibold">
							{move.black}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default MovesTable;