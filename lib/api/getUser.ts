export type TUser = {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
}

export const getUserfromUserId: (userId: string) => Promise<TUser | null> = async (userId: string) => {
	try {
		const res = await fetch(`${process.env.AUTH_URL}/api/user/${userId}`);
	
		const data = await res.json();
	
		const user = data.user;
		return user;
	} catch (err: any) {
		return null;
	}
}