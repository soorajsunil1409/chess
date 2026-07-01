export type Challenge = {
	challengeId: string;
	fromUserId: string;
	fromUsername: string;
	toUserId: string;
	toUsername: string;
	createdAt: number;
};

export const challenges = new Map<
	string,
	Challenge
>();