import { socket } from "@/lib/socket/socket";
import { Square } from "chess.js";

type GameMoveResponse = {
	success: boolean;
	error?: string;
};

export function gameMove(
	gameId: string,
	from: Square,
	to: Square,
	promotion: string
): Promise<GameMoveResponse> {
	return new Promise((resolve) => {
		socket.emit("game:move",
			{
				gameId: gameId,
				from: from,
				to: to,
				promotion: promotion
			},
			(response: GameMoveResponse) => {
				resolve(response);
			}
		)
	});	
}