import { getUsersFromSearchString } from "@/lib/db/getUser";
import { redirect } from "next/navigation";
import SearchPageWidget from "./SearchPageWidget";

const SearchPage = async ({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
	}>;
}) => {
	const { q } = await searchParams;

	if (!q) {
		redirect("/");
	}

	const users = await getUsersFromSearchString(q);
	
	if (!users) return <div>Error in query</div>

	return <SearchPageWidget users={users} />
};

export default SearchPage;