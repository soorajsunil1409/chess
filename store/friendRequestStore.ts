import { FriendRequest } from "@/lib/socket/stores/friends";
import { create } from "zustand";

interface FriendRequestStore {
	incomingFriendRequests: FriendRequest[];
	setIncomingFriendRequests: (incomingFriendRequests: FriendRequest[]) => void;

	outgoingFriendRequests: FriendRequest[];
	setOutgoingFriendRequests: (outgoingFriendRequests: FriendRequest[]) => void;
}

export const useFriendRequestStore = create<FriendRequestStore>(
	(set) => ({
		incomingFriendRequests: [],
		setIncomingFriendRequests: (incomingFriendRequests) =>
			set({ incomingFriendRequests }),
		outgoingFriendRequests: [],
		setOutgoingFriendRequests: (outgoingFriendRequests) =>
			set({ outgoingFriendRequests }),
	})
);