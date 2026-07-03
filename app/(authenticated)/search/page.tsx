import { getUsersFromSearchString } from "@/lib/db/getUser";
import { redirect } from "next/navigation";
import SearchPageWidget from "./SearchPageWidget";
import { auth } from "@/auth";

const SearchPage = async ({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
	}>;
}) => {
	const { q } = await searchParams;
	const session = await auth();

	if (!q || !session?.user?.id) {
		redirect("/");
	}

	const users = await getUsersFromSearchString(q)
		.then((users) =>
			users?.filter((user) =>
				user.id !== session.user?.id
			)
		);

	if (!users) return <div>Error in query</div>

	return <SearchPageWidget users={users} />
};

export default SearchPage;