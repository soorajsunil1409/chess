"use client"

import { Friend } from "@/lib/socket/stores/friends"
import { useFriendsStore } from "@/store/friendsStore";
import { useEffect } from "react";

type HydrationComponentProps = {
	friends: Friend[];
}

const HydrationComponent = ({
	friends
}: HydrationComponentProps) => {
	const setFriends = useFriendsStore((state) => state.setFriends);

	useEffect(() => {
		setFriends(friends);
	}, [friends])

	return <></>
}
export default HydrationComponent