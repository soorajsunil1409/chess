import { socket } from "@/lib/socket/socket";

type UnsendFriendRequestResponse = {
	success: boolean;
	error?: string;
};

export function unsendFriendRequest(
	requestId: string
): Promise<UnsendFriendRequestResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"friend_request:unsend",
			{ requestId },
			(res: UnsendFriendRequestResponse) => {
				resolve(res);
			}
		);
	});
}