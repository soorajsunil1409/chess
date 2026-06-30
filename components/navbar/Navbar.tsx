"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
	X,
	Search,
} from "lucide-react";

import { NavbarLoggedOut } from "./NavbarLoggedOut";
import Sidebar from "./Sidebar";
import NavbarLoggedIn from "./NavbarLoggedIn";

type Props = {
	children: React.ReactNode;
};

export default function Navbar({
	children,
}: Props) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);

	const handleSearch = () => {
		if (!search.trim()) return;

		console.log(search);

		router.push(`/search?q=${encodeURIComponent(search)}`);
	};

	const { data: session, status } = useSession();

	const [
		sidebarOpen,
		setSidebarOpen,
	] = useState(false);

	const [
		profileOpen,
		setProfileOpen,
	] = useState(false);

	if (status === "loading")
		return null;

	// Logged out
	if (!session) {
		return <NavbarLoggedOut children={children} />;
	}

	return (
		<div className="flex h-screen bg-[#090909] text-white">

			{/* Mobile overlay */}

			{sidebarOpen && (
				<div
					onClick={() =>
						setSidebarOpen(false)
					}
					className="fixed inset-0 z-40 bg-black/60 lg:hidden"
				/>
			)}

			{/* Sidebar */}
			<div>
				<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} session={session} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
			</div>

			{/* Main */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* Navbar */}
				<NavbarLoggedIn handleSearch={handleSearch} search={search} session={session} setSearch={setSearch} setSearchOpen={setSearchOpen} setSidebarOpen={setSidebarOpen} />

				{searchOpen && (
					<div className="border-b border-zinc-800 bg-[#111111] p-4 md:hidden">

						<div className="flex gap-2">

							<input
								autoFocus
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSearch();
										setSearchOpen(false);
									}
								}}
								placeholder="Search players..."
								className="flex-1 rounded-xl border border-zinc-700 bg-[#181818] px-4 py-2 text-sm outline-none focus:border-zinc-500"
							/>

							<button
								onClick={() => {
									handleSearch();
									setSearchOpen(false);
								}}
								className="rounded-xl bg-zinc-700 px-4 transition hover:bg-zinc-600"
							>
								<Search size={18} />
							</button>

							<button
								onClick={() => setSearchOpen(false)}
								className="rounded-xl px-3 transition hover:bg-zinc-800"
							>
								<X size={20} />
							</button>

						</div>

					</div>
				)}

				{/* Page */}
				<main className="min-h-0 flex-1 overflow-auto bg-[#090909]">
					<div className="h-full flex flex-col bg-[#333333]">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
