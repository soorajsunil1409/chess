import { auth } from "@/auth";
import HydrationComponent from "@/components/HydrationComponent";
import Navbar from "@/components/navbar/Navbar";
import { getFriendsOfUserId } from "@/lib/db/getFriends";
import SocketProvider from "@/providers/SocketProvider";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AuthLayout = async ({
	children,
}: {
	children: ReactNode;
}) => {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	const fetchedFriends = await getFriendsOfUserId(session.user.id);

	return (
		<div className="flex flex-col flex-1">
			<HydrationComponent friends={fetchedFriends} />
			<SocketProvider />
			<Navbar>
				{children}
			</Navbar>
		</div>
	)
}
export default AuthLayout