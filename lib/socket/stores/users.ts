export type TUser = {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
}

export const allUsers: TUser[] = [];