import { Chess } from "chess.js";
import { GameState } from "../socket/stores/games";

export const getGameStatus = (
	chess: Chess,
	result: GameState["result"]
) => ({
	isCheck: chess.isCheck(),
	isCheckMate: chess.isCheckmate(),
	isDraw: chess.isDraw(),
	isGameOver: result !== "" || chess.isGameOver(),
	isStalemate: chess.isStalemate(),
	isThreefoldRepetition: chess.isThreefoldRepetition(),
	isInsufficientMaterial: chess.isInsufficientMaterial(),
});