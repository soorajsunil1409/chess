"use client"

import { socket } from "@/lib/socket";
import { useChallengeStore } from "@/store/challengeStore";
import { useOnlineStore } from "@/store/onlineStore";
import { Bell, Check, Cross, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = () => {
	const router = useRouter();
	const { data: session, status } = useSession();

	const challenges = useChallengeStore((state) => state.challenges);
	const players = useOnlineStore((state) => state.players);

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
							<div className="flex gap-5 items-center">
								<div className="w-max relative">
									<Bell className="cursor-pointer" color="white" fill="white" />
									{
										challenges.length !== 0 &&
										<span className="absolute -top-1 right-0 size-1/2 aspect-square text-center bg-red-500 font-bold rounded-full" />
									}

									<div className="absolute top-10 right-0 flex flex-col bg-zinc-500 w-max p-3 rounded-md gap-5">
										{
											challenges.map((challenge) => (
												<div key={challenge.challengeId} className="flex gap-3 items-center">
													<div>You have a challenge from {challenge.fromUsername}</div>
													<Check
														className="bg-green-500 rounded-full p-1.5 h-full aspect-square w-auto text-white"
														onClick={() => socket.emit("challenge:accept", challenge.challengeId)}
													/>
													<X
														className="bg-red-400 rounded-full p-1.5 h-full aspect-square w-auto text-white"
														onClick={() => socket.emit("challenge:decline", challenge.challengeId)}
													/>
												</div>
											))
										}
									</div>
								</div>
								<button
									className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
									onClick={() => signOut()}
								>
									Sign Out
								</button>
							</div>
					}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;