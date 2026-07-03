import { Menu, Search } from "lucide-react";
import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";
import FriendRequestDropDown from "./dropdowns/FriendRequestDropDown";
import ChallengesDropDown from "./dropdowns/ChallengesDropDown";


type NavbarLoggedInProps = {
	setSidebarOpen: Dispatch<SetStateAction<boolean>>;
	setSearchOpen: Dispatch<SetStateAction<boolean>>;
	session: Session;
	search: string;
	setSearch: Dispatch<SetStateAction<string>>
	handleSearch: () => void
}

const NavbarLoggedIn = ({
	setSidebarOpen,
	setSearchOpen,
	session,
	search,
	setSearch,
	handleSearch,
}: NavbarLoggedInProps) => {

	return (
		<nav className="flex h-16 items-center justify-between border-b border-zinc-800 bg-[#111111] px-6">

			<div className="flex items-center gap-3">

				<button
					onClick={() => setSidebarOpen(true)}
					className="rounded-lg p-2 hover:bg-zinc-800 lg:hidden"
				>
					<Menu size={22} />
				</button>

				<button
					onClick={() => setSearchOpen(true)}
					className="rounded-lg p-2 hover:bg-zinc-800 md:hidden"
				>
					<Search size={20} />
				</button>

				<div className="relative hidden md:block">

					<Search
						size={18}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
					/>

					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch();
							}
						}}
						placeholder="Search players..."
						className="w-72 rounded-xl border border-zinc-700 bg-[#181818] py-2 pl-10 pr-20 text-sm outline-none transition focus:border-zinc-500"
					/>

					<button
						onClick={handleSearch}
						className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-zinc-700 px-3 py-1 text-xs transition hover:bg-zinc-600"
					>
						Search
					</button>

				</div>

			</div>

			<div className="flex items-center gap-3">

				{/* Challenges */}
				<ChallengesDropDown />

				{/* Messages */}
				<FriendRequestDropDown />

				{/* Navbar Profile */}

				<div className="flex items-center gap-3 rounded-xl bg-[#181818] px-3 py-2">

					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 font-semibold">
						{session.user?.name?.[0]?.toUpperCase() ?? "U"}
					</div>

					<div className="hidden md:flex flex-col">

						<span className="text-sm font-medium">
							{session.user?.name}
						</span>

						<span className="text-xs text-zinc-400">
							Online
						</span>

					</div>

				</div>

			</div>

		</nav>
	)
}

export default NavbarLoggedIn;