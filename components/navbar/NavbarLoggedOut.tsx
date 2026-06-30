import Link from "next/link";

export const NavbarLoggedOut = ({ children }: { children: React.ReactNode }) => {
	return <div className="min-h-screen bg-[#090909] text-white">
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
	</div>;
}
