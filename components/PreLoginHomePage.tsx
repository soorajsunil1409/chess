const PreLoginHomePage = () => {
	return (
		<main className="h-full bg-[#444444] text-white flex items-center justify-center">
			<section className="flex flex-col items-center gap-8 px-6 py-24">
				<div className="flex flex-col items-center gap-4">
					<h1 className="text-center text-6xl font-bold tracking-tight">
						Play Chess Online
					</h1>
				</div>

				<div className="flex gap-4">
					<button className="cursor-pointer rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200">
						Get Started
					</button>
				</div>
			</section>
		</main>
	)
}
export default PreLoginHomePage