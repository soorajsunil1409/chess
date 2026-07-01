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
		<div className="h-max w-full bg-[#333333]">
			<GamePageWidget gameId={gameId} />
		</div>
	)
}
export default GamePage