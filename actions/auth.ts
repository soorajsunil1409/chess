"use server";

import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const registerUser = async (values: unknown) => {
	const parsed = registerSchema.safeParse(values);

	if (!parsed.success) {
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	const { username, email, password } = parsed.data;

	const existingUser = await db.query.users.findFirst({
		where: or(
			eq(users.username, username),
			eq(users.email, email)
		)
	})

	console.log(existingUser);

	if (existingUser) {
		const errors: {
			username?: string[];
			email?: string[];
		} = {};

		if (existingUser.email === email) {
			errors.email = ["Email already exists"];
		}

		if (existingUser.username === username) {
			errors.username = ["Username already exists"];
		}

		return {
			success: false,
			errors
		}
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	await db.insert(users).values({
		id: nanoid(),
		email,
		username,
		passwordHash: hashedPassword
	})

	return {
		success: true
	}
}

export async function loginUser(values: {
	username: string;
	password: string;
}) {
	const parsed = loginSchema.safeParse(values);

	if (!parsed.success) {
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		await signIn("credentials", {
			username: parsed.data.username,
			password: parsed.data.password,
			redirect: false,
		});

		return {
			success: true,
		};
	} catch (err: any) {
		return {
			success: false,
			authError: "Invalid email or password " + err,
		};
	}
}