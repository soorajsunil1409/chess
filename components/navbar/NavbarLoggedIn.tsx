import { socket } from "@/lib/socket";
import { Challenge, useChallengeStore } from "@/store/challengeStore";
import { Bell, Check, Mail, Menu, Search, X } from "lucide-react";
import { Session } from "next-auth";
import { Dispatch, SetStateAction, useState } from "react";


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

	const challenges =
		useChallengeStore(
			(state) => state.challenges
		);

	const [
		challengeOpen,
		setChallengeOpen,
	] = useState(false);

	const [
		messageOpen,
		setMessageOpen,
	] = useState(false);


	const acceptChallenge = (
		challenge: Challenge
	) => {
		socket.emit(
			"challenge:accept",
			challenge.challengeId
		);

		setChallengeOpen(false);
	};

	const declineChallenge = (
		challenge: Challenge
	) => {
		socket.emit(
			"challenge:decline",
			challenge.challengeId
		);

		setChallengeOpen(false);
	};

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

				<div className="relative">

					<button
						onClick={() =>
							setChallengeOpen(
								!challengeOpen
							)
						}
						className="relative rounded-lg p-2 transition hover:bg-zinc-800"
					>

						<Bell size={20} />

						{challenges.length > 0 && (

							<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">

								{challenges.length}

							</span>

						)}

					</button>

					{challengeOpen && (

						<div className="absolute z-100 right-0 mt-3 w-96 overflow-hidden rounded-xl border border-zinc-700 bg-[#181818] shadow-2xl">

							<div className="border-b border-zinc-700 p-4 font-semibold">
								Challenges
							</div>

							{challenges.length === 0 ? (

								<div className="p-6 text-center text-zinc-400">
									No pending challenges
								</div>

							) : (

								challenges.map((challenge) => (

									<div
										key={challenge.challengeId}
										className="flex items-center justify-between border-b border-zinc-800 p-4"
									>

										<div>

											<div className="font-medium">
												{
													challenge.fromUsername
												}
											</div>

											<div className="text-sm text-zinc-400">
												challenged you
											</div>

										</div>

										<div className="flex gap-2">

											<button
												onClick={() =>
													acceptChallenge(
														challenge
													)
												}
												className="rounded-lg bg-green-600 p-2 hover:bg-green-500"
											>

												<Check size={16} />

											</button>

											<button
												onClick={() =>
													declineChallenge(
														challenge
													)
												}
												className="rounded-lg bg-red-600 p-2 hover:bg-red-500"
											>

												<X size={16} />

											</button>

										</div>

									</div>

								))

							)}

						</div>

					)}

				</div>

				{/* Messages */}
				<div className="relative">

					<button
						onClick={() =>
							setMessageOpen(!messageOpen)
						}
						className="rounded-lg p-2 transition hover:bg-zinc-800"
					>
						<Mail size={20} />
					</button>

					{messageOpen && (

						<div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-zinc-700 bg-[#181818] shadow-2xl">

							<div className="border-b border-zinc-700 p-4 font-semibold">
								Messages
							</div>

							<div className="flex h-40 items-center justify-center text-sm text-zinc-400">
								No messages available.
							</div>

						</div>

					)}

				</div>

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