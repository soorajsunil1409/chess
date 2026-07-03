import { socket } from "@/lib/socket/socket";

type SendFriendRequestResponse = {
	success: boolean;
	error?: string;
};

export function sendFriendRequest(
	targetUserId: string
): Promise<SendFriendRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"friend_request:send",
			{ targetUserId },
			(res: SendFriendRequestResponse) => {
				resolve(res);
			}
		);
	});
}