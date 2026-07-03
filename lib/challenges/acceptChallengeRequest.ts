import { socket } from "@/lib/socket/socket";

type AcceptChallengeRequestResponse = {
	success: boolean;
	error?: string;
};

export function acceptChallengeRequest(
	challengeId: string
): Promise<AcceptChallengeRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"challenge:accept",
			{ challengeId },
			(res: AcceptChallengeRequestResponse) => {
				resolve(res);
			});
	});
}