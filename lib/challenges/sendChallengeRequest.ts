import { socket } from "@/lib/socket/socket";

type SendChallengeRequestResponse = {
	success: boolean;
	error?: string;
};

export function sendChallengeRequest(
	targetUserId: string
): Promise<SendChallengeRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"challenge:send",
			{ targetUserId },
			(res: SendChallengeRequestResponse) => {
				resolve(res);
			});
	});
}