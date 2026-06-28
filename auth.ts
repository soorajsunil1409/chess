// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
	session: {
		strategy: "jwt",
	},

	providers: [
		Credentials({
			credentials: {
				username: {
					type: "username",
					label: "username",
					placeholder: "Username",
				},
				password: {
					type: "password",
					label: "Password",
					placeholder: "*****",
				},
			},

			async authorize(credentials) {
				if (!credentials) return null;

				const username = credentials.username as string;
				const password = credentials.password as string;

				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.username, username))
					.limit(1);

				if (!user) {
					return null;
				}

				const validPassword = await bcrypt.compare(
					password,
					user.passwordHash
				);

				if (!validPassword) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					username: user.username,
					name: user.username,
				};
			},
		}),
	],

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
			}

			return session;
		},
	},
});