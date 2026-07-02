import { socket } from "@/lib/socket/socket";

type RemoveFriendResponse = {
	success: boolean;
	error?: string;
};

export function removeFriend(
	user1Id: string,
	user2Id: string
): Promise<RemoveFriendResponse> {
	return new Promise((resolve) => {
		socket.emit(
			"friend:remove",
			{ user1Id, user2Id },
			(response: RemoveFriendResponse) => {
				resolve(response);
			}
		);
	});
}