import { getGameFromGameId } from "@/lib/db/getGames";
import GameReviewWidget from "../GameReviewWidget";

const GameReviewPage = async ({ params }: {
	params: Promise<{
		gameId: string;
	}>
}) => {
	const { gameId } = await params;
	const game = await getGameFromGameId(gameId);
	if (!game) return;

	return (
		<div className="p-2">
			<GameReviewWidget gameId={gameId} game={game} />
		</div>
	)
}
export default GameReviewPage