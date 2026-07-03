export type Challenge = {
	challengeId: string;
	fromUserId: string;
	fromUsername: string;
	toUserId: string;
	toUsername: string;
	createdAt: number;
};

export class ChallengeStore {
	public incomingChallenges = new Map<
		string,
		Map<string, Challenge>
	>();

	public outgoingChallenges = new Map<
		string,
		Map<string, Challenge>
	>();

	private challengesById = new Map<string, Challenge>();

	private addChallenge(challenge: Challenge) {
		let incoming = this.incomingChallenges.get(challenge.toUserId);

		if (!incoming) {
			incoming = new Map();
			this.incomingChallenges.set(challenge.toUserId, incoming);
		}

		incoming.set(challenge.fromUserId, challenge);

		let outgoing = this.outgoingChallenges.get(challenge.fromUserId);

		if (!outgoing) {
			outgoing = new Map();
			this.outgoingChallenges.set(challenge.fromUserId, outgoing);
		}

		outgoing.set(challenge.toUserId, challenge);

		this.challengesById.set(challenge.challengeId, challenge);
	}

	private removeChallenge(challenge: Challenge) {
		this.challengesById.delete(challenge.challengeId);

		const incoming = this.incomingChallenges.get(challenge.toUserId);

		if (incoming) {
			incoming.delete(challenge.fromUserId);

			if (incoming.size === 0) {
				this.incomingChallenges.delete(challenge.toUserId);
			}
		}

		const outgoing = this.outgoingChallenges.get(challenge.fromUserId);

		if (outgoing) {
			outgoing.delete(challenge.toUserId);

			if (outgoing.size === 0) {
				this.outgoingChallenges.delete(challenge.fromUserId);
			}
		}
	}

	createChallenge({
		fromUserId,
		fromUsername,
		toUserId,
		toUsername,
	}: {
		fromUserId: string;
		fromUsername: string;
		toUserId: string;
		toUsername: string;
	}) {
		const challenge: Challenge = {
			challengeId: crypto.randomUUID(),
			fromUserId,
			fromUsername,
			toUserId,
			toUsername,
			createdAt: Date.now(),
		};

		this.addChallenge(challenge);

		return challenge;
	}

	acceptChallenge(challengeId: string, userId: string) {
		const challenge = this.challengesById.get(challengeId);

		if (!challenge) {
			return null;
		}

		if (challenge.toUserId !== userId) {
			return null;
		}

		this.removeChallenge(challenge);

		return challenge;
	}

	declineChallenge(challengeId: string, userId: string) {
		const challenge = this.challengesById.get(challengeId);

		if (!challenge) {
			return null;
		}

		if (challenge.toUserId !== userId) {
			return null;
		}

		this.removeChallenge(challenge);

		return challenge;
	}

	getIncoming(userId: string) {
		return [...(this.incomingChallenges.get(userId)?.values() ?? [])];
	}

	getOutgoing(userId: string) {
		return [...(this.outgoingChallenges.get(userId)?.values() ?? [])];
	}

	getChallenge(fromUserId: string, toUserId: string) {
		return this.incomingChallenges
			.get(toUserId)
			?.get(fromUserId);
	}

	hasChallenge(fromUserId: string, toUserId: string) {
		return this.getChallenge(fromUserId, toUserId) !== undefined;
	}
}

export const challengeStore = new ChallengeStore();