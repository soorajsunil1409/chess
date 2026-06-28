import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { GameState } from "@/lib/socket/stores/games";
import MovesTable from "./MovesTable";
import GameActions from "./GameActions";

type DetailsSidebarProps = {
	turn: string;
	gameState: GameState;
	isReview?: boolean;
	handleMoveClick?: (moveIdx: number) => void;
};

const DetailsSidebar = ({
	turn,
	gameState,
	isReview,
	handleMoveClick
}: DetailsSidebarProps) => {
	const formattedHistory = useMemo(() => {
		const history = []

		for (let i = 0; i < gameState?.history?.length!; i += 2) {
			history.push({
				moveNumber: Math.floor(i / 2) + 1,
				white: gameState?.history[i],
				black: gameState?.history[i + 1] ?? "",
			});
		}

		return history;

	}, [gameState?.history]);

	return (
		<div className="w-full bg-[#222222] rounded-md flex flex-col overflow-auto h-full">
			<div className="flex items-center gap-3 p-5">
				<div
					className="size-6 rounded"
					style={{ backgroundColor: turn.toLowerCase() }}
				/>
				<div className="text-2xl font-bold text-white">
					{turn} to Move
				</div>
			</div>

			<Separator />

			<div className="overflow-auto rounded-md flex-1 min-h-0">
				<MovesTable formattedHistory={formattedHistory} handleMoveClick={handleMoveClick} />
			</div>

			<Separator />
		</div>
	);
};

export default DetailsSidebar;