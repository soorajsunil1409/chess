import { socket } from "@/lib/socket/socket";

type RejectFriendRequestResponse = {
	success: boolean;
	error?: string;
};

export function rejectFriendRequest(
	requestId: string
): Promise<RejectFriendRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"friend_request:decline",
			{ requestId },
			(response: RejectFriendRequestResponse) => {
				resolve(response);
			}
		);
	});
}