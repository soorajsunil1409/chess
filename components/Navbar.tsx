"use client"

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = () => {
	const router = useRouter();
	const { data: session, status } = useSession();

	return (
		<nav className="border-b border-zinc-800 bg-zinc-950">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<h1 className="text-xl font-bold tracking-wide text-white">
						Chess
					</h1>
				</div>

				{/* Navigation */}
				<div className="hidden items-center gap-8 md:flex">
					<a
						href="/"
						className="text-sm font-medium text-zinc-300 transition hover:text-white"
					>
						Home
					</a>

					<a
						href="/play"
						className="text-sm font-medium text-zinc-300 transition hover:text-white"
					>
						Play
					</a>

					<a
						href="/online"
						className="text-sm font-medium text-zinc-300 transition hover:text-white"
					>
						Online Players
					</a>

					<a
						href="/games"
						className="text-sm font-medium text-zinc-300 transition hover:text-white"
					>
						Active Games
					</a>
				</div>

				{/* Right Side */}
				<div className="flex items-center gap-3">
					{
						!session ?
							<>
								<button
									className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
									onClick={() => router.push("/login")}
								>
									Login
								</button>

								<button
									className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
									onClick={() => router.push("/signup")}
								>
									Sign Up
								</button>
							</> :
							<button
								className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
								onClick={() => signOut()}
							>
								Sign Out
							</button>
					}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;