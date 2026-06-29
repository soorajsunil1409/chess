import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
	return (
		<main className="flex w-full flex-1 flex-col justify-center bg-[#090909] p-6 lg:min-h-0">
			<div className="flex w-full max-w-7xl flex-col gap-6 lg:min-h-0">

				<div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#181818] p-6">

					<div className="flex items-center gap-5">

						<Skeleton className="h-24 w-24 rounded-full" />

						<div className="flex flex-col gap-3">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-5 w-64" />
						</div>

					</div>

					<Skeleton className="h-11 w-32 rounded-lg" />

				</div>

				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#181818] p-5"
						>
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-8 w-12" />
						</div>
					))}

				</div>

				<div className="flex flex-col gap-6 lg:min-h-0 lg:flex-row">

					<div className="flex min-h-0 flex-1 flex-col gap-4">

						<div className="flex items-center justify-between">

							<Skeleton className="h-7 w-40" />

							<Skeleton className="h-10 w-24 rounded-lg" />

						</div>

						<div className="flex flex-1 flex-col gap-3 rounded-xl border border-zinc-800 bg-[#181818] p-4">

							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"
								>
									<div className="flex flex-col gap-2">
										<Skeleton className="h-5 w-36" />
										<Skeleton className="h-4 w-24" />
									</div>

									<div className="flex flex-col items-end gap-2">
										<Skeleton className="h-5 w-20" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							))}

						</div>

					</div>

					<div className="flex w-full flex-col gap-4 lg:w-80">

						<div className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<Skeleton className="h-7 w-24" />

							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between"
								>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-28" />
								</div>
							))}

						</div>

						<div className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-[#181818] p-6">

							<Skeleton className="h-7 w-24" />

							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between"
								>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}

						</div>

					</div>

				</div>

			</div>
		</main>
	);
};

export default ProfileSkeleton;