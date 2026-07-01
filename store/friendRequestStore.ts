import { FriendRequest } from "@/lib/socket/stores/friends";
import { create } from "zustand";

interface FriendRequestStore {
	friendRequests: FriendRequest[];
	setFriendRequests: (players: FriendRequest[]) => void;
}

export const useFriendRequestStore = create<FriendRequestStore>(
	(set) => ({
		friendRequests: [],
		setFriendRequests: (friendRequests) =>
			set({ friendRequests }),
	})
);