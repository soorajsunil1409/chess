const LobbyRightColumnWidget = () => {
	return (
		<div className="flex w-full flex-col gap-4 lg:w-80">

			<div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#181818] p-6">

				<div className="text-xl font-semibold">
					Quick Play
				</div>

				<button className="rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200">
					Random Match
				</button>

				<button className="rounded-lg border border-zinc-700 bg-[#111111] px-4 py-3 transition hover:bg-zinc-800">
					Create Private Match
				</button>

			</div>

		</div>
	)
}
export default LobbyRightColumnWidget