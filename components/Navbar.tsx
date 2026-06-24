"use client"

import { socket } from "@/lib/socket";
import { useChallengeStore } from "@/store/challengeStore";
import { Bell, Check, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [open, setOpen] = useState(false);

	const challenges = useChallengeStore((state) => state.challenges);

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
								<div className="relative">
									<button
										onClick={() => setOpen(!open)}
										className="relative rounded-lg p-2 hover:bg-zinc-800 transition"
									>
										<Bell className="size-5 text-zinc-200" />

										{challenges.length > 0 && (
											<span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
												{challenges.length}
											</span>
										)}
									</button>

									{open && (
										<div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
											<div className="border-b border-zinc-800 p-4">
												<h3 className="font-semibold text-white">
													Challenges
												</h3>
											</div>

											{challenges.length === 0 ? (
												<div className="p-4 text-sm text-zinc-400">
													No pending challenges
												</div>
											) : (
												<div className="flex flex-col">
													{challenges.map((challenge) => (
														<div
															key={challenge.challengeId}
															className="flex items-center justify-between border-b border-zinc-800 p-4"
														>
															<div className="flex flex-col">
																<span className="font-medium text-white">
																	{challenge.fromUsername}
																</span>

																<span className="text-sm text-zinc-400">
																	challenged you to a game
																</span>
															</div>

															<div className="flex gap-2">
																<button
																	className="rounded-lg bg-green-600 p-2 hover:bg-green-500"
																	onClick={() =>
																		socket.emit(
																			"challenge:accept",
																			challenge.challengeId
																		)
																	}
																>
																	<Check className="size-4 text-white" />
																</button>

																<button
																	className="rounded-lg bg-red-600 p-2 hover:bg-red-500"
																	onClick={() =>
																		socket.emit(
																			"challenge:decline",
																			challenge.challengeId
																		)
																	}
																>
																	<X className="size-4 text-white" />
																</button>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									)}
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