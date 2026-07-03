type LobbyPageProps = {
	username: string;
}

const LobbyHeader = ({
	username
}: LobbyPageProps) => {
	return (
		<div className="flex flex-col gap-2">
			<h1 className="text-4xl font-bold">
				Welcome back, {username}
			</h1>
		</div>
	)
}
export default LobbyHeader