import { z } from "zod";

export const registerSchema = z.object({
	username: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name can have a max of 50 characters"),
	email: z.email(),
	password: z
		.string()
		.min(8, "Password must have atleast 8 characters")
		.max(100, "Password can have a max of 100 characters"),
	confirmPassword: z
		.string()
		.min(8, "Password must have atleast 8 characters")
		.max(100, "Password can have a max of 100 characters"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
}).transform(({ username, password, email }) => ({
	username,
	email,
	password
}));

export const loginSchema = z.object({
	username: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name can have a max of 50 characters"),
	password: z
		.string()
		.min(8, "Password must have atleast 8 characters")
		.max(100, "Password can have a max of 100 characters")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;