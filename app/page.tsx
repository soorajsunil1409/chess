import HomePageWidget from "../components/HomePageWidget"
import { auth } from "@/auth";

const HomePage = async () => {
	const session = await auth();
	return (
		<HomePageWidget session={session} />
	)
}
export default HomePage