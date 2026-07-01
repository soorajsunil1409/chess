import HomePageWidget from "@/components/HomePageWidget"
import { auth } from "@/auth";

// TODO when logged out you cant access homepage
const HomePage = async () => {
	const session = await auth();

	return (
		<HomePageWidget session={session} />
	)
}
export default HomePage