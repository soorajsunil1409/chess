import { Friend } from "@/lib/socket/stores/friends";
import { create } from "zustand";

interface FriendsStore {
	friends: Friend[];
	friendIds: Set<string>;

	setFriends: (friends: Friend[]) => void;

	addFriend: (friend: Friend) => void;
	removeFriend: (userId: string) => void;

	isFriend: (userId: string) => boolean;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
	friends: [],
	friendIds: new Set(),

	setFriends: (friends) =>
		set({
			friends,
			friendIds: new Set(friends.map((f) => f.user.id)),
		}),

	addFriend: (friend) =>
		set((state) => ({
			friends: [...state.friends, friend],
			friendIds: new Set(state.friendIds).add(friend.user.id),
		})),

	removeFriend: (userId) =>
		set((state) => ({
			friends: state.friends.filter(
				(f) => f.user.id !== userId
			),
			friendIds: new Set(
				[...state.friendIds].filter(
					(id) => id !== userId
				)
			),
		})),

	isFriend: (userId) => get().friendIds.has(userId),
}));