import { socket } from "@/lib/socket/socket";

type DeclineChallengeRequestResponse = {
	success: boolean;
	error?: string;
};

export function declineChallengeRequest(
	challengeId: string
): Promise<DeclineChallengeRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"challenge:decline",
			{ challengeId },
			(res: DeclineChallengeRequestResponse) => {
				resolve(res);
			});
	});
}