import GamePageWidget from "../GamePageWidget";

const GamePage = async ({
	params,
}: {
	params: Promise<{
		gameId: string;
	}>;
}) => {
	const { gameId } = await params;

	return (
		<div className="h-full w-full">
			<GamePageWidget gameId={gameId} />
		</div>
	)
}
export default GamePage