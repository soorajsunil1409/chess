import { Chess, DEFAULT_POSITION } from "chess.js"
import HomePageWidget from "./HomePageWidget"

const HomePage = () => {
	const chess = new Chess(DEFAULT_POSITION);
	const board = chess.board();

	console.log(chess.board());

	return (
		<HomePageWidget board={board} />
	)
}
export default HomePage