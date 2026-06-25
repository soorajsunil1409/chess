import GameReviewWidget from "../GameReviewWidget";

const GameReviewPage = async ({ params }: {
	params: Promise<{
		gameId: string;
	}>
}) => {
	const {gameId} = await params;

	return (
		<div className="p-2">
			<GameReviewWidget gameId={gameId} />
		</div>
	)
}
export default GameReviewPage