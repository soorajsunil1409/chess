import { socket } from "@/lib/socket/socket";

type AcceptFriendRequestResponse = {
	success: boolean;
	error?: string;
};

export function acceptFriendRequest(
	requestId: string
): Promise<AcceptFriendRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"friend_request:accept",
			{ requestId },
			(response: AcceptFriendRequestResponse) => {
				resolve(response);
			}
		);
	});
}