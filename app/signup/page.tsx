"use client";

import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
	const router = useRouter();

	const [username, setUsername] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [verifyPassword, setVerifyPassword] = useState<string>("");

	const [errors, setErrors] = useState<{
		username?: string[];
		email?: string[];
		password?: string[];
		confirmPassword?: string[];
	}>({});


	const handleSubmit = async (
		e: React.SubmitEvent<HTMLFormElement>
	) => {
		e.preventDefault();

		setErrors({});

		const result = await registerUser({
			username,
			email,
			password,
			confirmPassword: verifyPassword,
		});

		if (!result.success) {
			setErrors(result.errors ?? {});
			return;
		}

		toast.success("Successfully created user!")

		router.push("/login");
	};

	return (
		<main className="min-h-screen bg-[#444444] text-white flex items-center justify-center px-6">
			<div className="flex w-full max-w-md flex-col gap-8">
				<div className="flex flex-col gap-3">
					<h1 className="text-5xl font-bold tracking-tight">
						Create Account
					</h1>

					<p className="text-zinc-300">
						Create an account and start challenging players online.
					</p>
				</div>

				<form
					className="flex flex-col gap-4"
					onSubmit={handleSubmit}
				>
					<div className="flex flex-col gap-1">
						<Input
							placeholder="Username"
							className="h-12 border-none bg-white/10 text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-white/30"
							value={username}
							onChange={(e) => setUsername(() => e.target.value)}
						/>

						{errors.username?.[0] && (
							<p className="text-sm text-red-400">
								{errors.username[0]}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<Input
							type="email"
							placeholder="Email"
							className="h-12 border-none bg-white/10 text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-white/30"
							value={email}
							onChange={(e) => setEmail(() => e.target.value)}
						/>

						{errors.email?.[0] && (
							<p className="text-sm text-red-400">
								{errors.email[0]}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<Input
							type="password"
							placeholder="Password"
							className="h-12 border-none bg-white/10 text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-white/30"
							value={password}
							onChange={(e) => setPassword(() => e.target.value)}
						/>

						{errors.password?.[0] && (
							<p className="text-sm text-red-400">
								{errors.password[0]}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<Input
							type="password"
							placeholder="Confirm Password"
							className="h-12 border-none bg-white/10 text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-white/30"
							value={verifyPassword}
							onChange={(e) => setVerifyPassword(() => e.target.value)}
						/>

						{errors.confirmPassword?.[0] && (
							<p className="text-sm text-red-400">
								{errors.confirmPassword[0]}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="mt-2 h-12 bg-white text-black hover:bg-zinc-200"
					>
						Create Account
					</Button>
				</form>

				<div className="flex justify-center">
					<p className="text-sm text-zinc-300">
						Already have an account?{" "}
						<a
							href="/login"
							className="font-medium text-white transition hover:opacity-80"
						>
							Sign In
						</a>
					</p>
				</div>
			</div>
		</main>
	);
}