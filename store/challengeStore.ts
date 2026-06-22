import { create } from "zustand";

export type Challenge = {
	challengeId: string;
	fromUserId: string;
	fromUsername: string;
	toUserId: string;
	toUsername: string;
	createdAt: number;
};

interface ChallengeStore {
	challenges: Challenge[];

	addChallenge: (
		challenge: Challenge
	) => void;

	setChallenges: (
		challenges: Challenge[]
	) => void;

	removeChallenge: (
		userId: string
	) => void;
}

export const useChallengeStore =
	create<ChallengeStore>((set) => ({
		challenges: [],

		addChallenge: (challenge) =>
			set((state) => ({
				challenges: [
					...state.challenges,
					challenge,
				],
			})),

		setChallenges: (challenges) =>
			set(() => ({
				challenges: challenges,
			})),

		removeChallenge: (userId) =>
			set((state) => ({
				challenges:
					state.challenges.filter(
						(c) =>
							c.fromUserId !==
							userId
					),
			})),
	}));