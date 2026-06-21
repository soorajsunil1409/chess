import { Chess } from "chess.js"
import HomePageWidget from "../components/HomePageWidget"
import { auth } from "@/auth";

const HomePage = async () => {
	const chess = new Chess();
	const session = await auth();

	return (
		<HomePageWidget session={session} />
	)
}
export default HomePage