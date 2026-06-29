"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import {
	Bell,
	Menu,
	X,
	Home,
	User,
	Users,
	Swords,
	History,
	Mail,
	Search,
	ChevronDown,
	LogOut,
	Settings,
	Check,
} from "lucide-react";

import { socket } from "@/lib/socket";
import {
	Challenge,
	useChallengeStore,
} from "@/store/challengeStore";

type Props = {
	children: React.ReactNode;
};

const navItems = [
	{
		name: "Lobby",
		href: "/",
		icon: Home,
	},
	{
		name: "Profile",
		href: "/profile",
		icon: User,
	},
	{
		name: "Friends",
		href: "/friends",
		icon: Users,
	},
	{
		name: "Players",
		href: "/online",
		icon: Users,
	},
	{
		name: "History",
		href: "/history",
		icon: History,
	},
];

export default function Navbar({
	children,
}: Props) {
	const pathname = usePathname();

	const {
		data: session,
		status,
	} = useSession();

	const challenges =
		useChallengeStore(
			(state) => state.challenges
		);

	const [
		sidebarOpen,
		setSidebarOpen,
	] = useState(false);

	const [
		challengeOpen,
		setChallengeOpen,
	] = useState(false);

	const [
		messageOpen,
		setMessageOpen,
	] = useState(false);

	const [
		profileOpen,
		setProfileOpen,
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

	if (status === "loading")
		return null;

	// Logged out
	if (!session) {
		return (
			<div className="min-h-screen bg-[#090909] text-white">
				<nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111111]">
					<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
						<Link
							href="/"
							className="text-xl font-bold"
						>
							♟ Chess
						</Link>

						<div className="flex items-center gap-6">
							<Link
								href="/"
								className="text-sm text-zinc-300 hover:text-white"
							>
								Home
							</Link>

							<Link
								href="/login"
								className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
							>
								Login
							</Link>

							<Link
								href="/signup"
								className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
							>
								Sign Up
							</Link>
						</div>
					</div>
				</nav>

				{children}
			</div>
		);
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

			<aside
				className={`fixed left-0 top-0 z-200 flex h-full lg:w-50 w-72 flex-col border-r border-zinc-800 bg-[#111111] transition-transform lg:static lg:translate-x-0 ${sidebarOpen
					? "translate-x-0"
					: "-translate-x-full"
					}`}
			>

				{/* Logo */}
				<div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
					<Link
						href="/"
						className="text-xl font-bold"
					>
						♟ Chess
					</Link>

					<button
						onClick={() =>
							setSidebarOpen(false)
						}
						className="lg:hidden"
					>
						<X />
					</button>
				</div>


				<div className="flex flex-col justify-between h-full">
					{/* Navigation */}
					<div className="flex flex-col gap-2 p-4">

						{navItems.map(
							(item) => {
								const Icon =
									item.icon;

								let href = item.href;

								if (item.name === "Profile") href = `/profile/${session.user?.id}`

								return (
									<Link
										key={item.href}
										href={href}
										className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${pathname ===
											item.href
											? "bg-zinc-800 text-white"
											: "text-zinc-400 hover:bg-zinc-900 hover:text-white"
											}`}
									>
										<Icon
											size={
												20
											}
										/>

										{
											item.name
										}
									</Link>
								);
							}
						)}
					</div>

					{/* Bottom User */}
					<div className="border-t border-zinc-800 p-4">
						<div className="relative">
							<button
								onClick={() =>
									setProfileOpen(!profileOpen)
								}
								className="flex w-full items-center gap-3 rounded-xl bg-[#181818] p-3 transition hover:bg-zinc-800"
							>

								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-700 font-bold">
									{session.user?.name?.[0]?.toUpperCase() ?? "U"}
								</div>

								<div className="flex flex-1 flex-col items-start">

									<div className="font-medium">
										{session.user?.name}
									</div>

									<div className="text-xs text-green-400">
										Online
									</div>

								</div>

								<ChevronDown
									size={18}
									className={`transition ${profileOpen
										? "rotate-180"
										: ""
										}`}
								/>

							</button>

							{profileOpen && (

								<div className="absolute bottom-full mb-3 w-full overflow-hidden rounded-xl border border-zinc-700 bg-[#181818] shadow-2xl">

									<Link
										href="/profile"
										className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"
									>
										<User size={18} />
										Profile
									</Link>

									<Link
										href="/friends"
										className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"
									>
										<Users size={18} />
										Friends
									</Link>

									<button
										className="flex w-full items-center gap-3 px-4 py-3 hover:bg-zinc-800"
									>
										<Settings size={18} />
										Settings
									</button>

									<button
										onClick={() => signOut()}
										className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white"
									>
										<LogOut size={18} />
										Sign Out
									</button>

								</div>

							)}

						</div>

					</div>
				</div>

			</aside>

			{/* Main */}

			<div className="flex min-w-0 flex-1 flex-col">

				{/* Navbar */}

				<nav className="flex h-16 items-center justify-between border-b border-zinc-800 bg-[#111111] px-6">

					<div className="flex items-center gap-4">

						<button
							onClick={() =>
								setSidebarOpen(true)
							}
							className="rounded-lg p-2 hover:bg-zinc-800 lg:hidden"
						>
							<Menu size={22} />
						</button>

						<div className="relative hidden md:block">

							<Search
								size={18}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
							/>

							<input
								placeholder="Search players..."
								className="w-72 rounded-xl border border-zinc-700 bg-[#181818] py-2 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-500"
							/>

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