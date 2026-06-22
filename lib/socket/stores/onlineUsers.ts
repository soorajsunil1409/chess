export type OnlinePlayer = {
	userId: string;
	username: string;
	socketId: string;
};

export const onlineUsers = new Map<
	string,
	OnlinePlayer
>();