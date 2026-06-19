import { Chess, DEFAULT_POSITION } from "chess.js"
import HomePageWidget from "./HomePageWidget"

const HomePage = () => {
	const chess = new Chess();
	const board = chess.board();

	return (
		<HomePageWidget />
	)
}
export default HomePage