"use client";

import { useState } from "react";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { loginSchema } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";

type LoginErrors =
	z.inferFlattenedErrors<typeof loginSchema>["fieldErrors"];

export default function LoginPage() {
	const router = useRouter();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [errors, setErrors] = useState<LoginErrors>({});
	const [authError, setAuthError] = useState("");

	const handleSubmit = async (
		e: React.SubmitEvent<HTMLFormElement>
	) => {
		e.preventDefault();

		setErrors({});
		setAuthError("");

		const result = await loginUser({
			username,
			password,
		});

		if (!result.success) {
			if (result.errors) {
				setErrors(result.errors);
			}

			if (result.authError) {
				setAuthError(result.authError);
			}

			return;
		}

		// window.location.href = "/";
		router.push("/");
	};

	return (
		<main className="min-h-screen bg-[#444444] text-white flex items-center justify-center px-6">
			<div className="flex w-full max-w-md flex-col gap-8">
				<div className="flex flex-col gap-3">
					<h1 className="text-5xl font-bold tracking-tight">
						Sign In
					</h1>

					<p className="text-zinc-300">
						Welcome back.
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-4"
				>
					<div className="flex flex-col gap-1">
						<Input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="h-12 border-none bg-white/10 text-white"
						/>

						{errors.username?.[0] && (
							<p className="text-sm text-red-400">
								{errors.username[0]}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) =>
								setPassword(e.target.value)
							}
							className="h-12 border-none bg-white/10 text-white"
						/>

						{errors.password?.[0] && (
							<p className="text-sm text-red-400">
								{errors.password[0]}
							</p>
						)}
					</div>

					{authError && (
						<p className="text-sm text-red-400">
							{authError}
						</p>
					)}

					<Button
						type="submit"
						className="h-12 bg-white text-black hover:bg-zinc-200"
					>
						Sign In
					</Button>
				</form>

				<p className="text-center text-sm text-zinc-300">
					Don't have an account?{" "}
					<a
						href="/signup"
						className="text-white font-medium"
					>
						Create one
					</a>
				</p>
			</div>
		</main>
	);
}