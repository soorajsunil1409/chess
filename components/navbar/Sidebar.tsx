import { ChevronDown, History, Home, LogOut, Settings, User, Users, X } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

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

type SidebarProps = {
	sidebarOpen: boolean;
	setSidebarOpen: Dispatch<SetStateAction<boolean>>;
	session: Session;
	setProfileOpen: Dispatch<SetStateAction<boolean>>;
	profileOpen: boolean;
}

const Sidebar = ({
	sidebarOpen,
	setSidebarOpen,
	session,
	setProfileOpen,
	profileOpen
}: SidebarProps) => {
	const pathname = usePathname();
	
	return (
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
							const Icon = item.icon;

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
									<Icon size={20} />

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
	)
}
export default Sidebar