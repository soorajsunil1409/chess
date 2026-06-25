"use client";

import BoardPlayspace from "@/components/board/BoardPlayspace";
import CapturedPiecesWidget from "@/components/CapturedPiecesWidget";
import { DbGameState, GameState, LastMove } from "@/lib/socket/stores/games";
import { Chess, PieceSymbol, Square } from "chess.js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"

// TODO change this
const convertGameToGameState = (
	game: DbGameState,
	chess: Chess
): GameState => {
	const history =
		chess.history({
			verbose: true
		})

	const last = history.at(-1);

	const lastMove: LastMove | null = last
		? {
			from: last.from,
			to: last.to,
			piece: last.piece,
			color: last.color,
			captured: last.captured,
			san: last.san,
		}
		: null;

	const whitesCapturedPieces: PieceSymbol[] = [];
	const blacksCapturedPieces: PieceSymbol[] = [];

	for (const move of history) {
		if (move.captured) {
			if (move.color === "w") {
				whitesCapturedPieces.push(move.captured);
			} else {
				blacksCapturedPieces.push(move.captured);
			}
		}

		if (move.promotion) {
			if (move.color === "w") {
				blacksCapturedPieces.push("p");
			} else {
				whitesCapturedPieces.push("p");
			}
		}
	}

	const gameState: GameState = {
		gameId: game.id,

		fen: "",

		lastMove: lastMove,

		history: chess.history(),

		turn: chess.turn(),

		status: {
			isCheck: chess.isCheck(),
			isCheckMate: chess.isCheckmate(),
			isDraw: chess.isDraw(),
			isGameOver: false, // TODO check this later
			isStalemate: chess.isStalemate(),
			isThreefoldRepetition:
				chess.isThreefoldRepetition(),
			isInsufficientMaterial:
				chess.isInsufficientMaterial(),
		},

		material: {
			white: 0,
			black: 0,
			advantage: 0
		},

		whitesCapturedPieces: whitesCapturedPieces,
		blacksCapturedPieces: blacksCapturedPieces,

		whitePlayerId: game.whitePlayerId,
		whitePlayerUsername: game.whitePlayerUsername,

		blackPlayerId: game.blackPlayerId,
		blackPlayerUsername: game.blackPlayerUsername,

		winner: (game.winner ?? "") as GameState["winner"],
		resignedBy: (game.resignedBy ?? "") as GameState["resignedBy"],
		result: (game.result ?? "") as GameState["result"],
	};

	return gameState;
};


const GameReviewWidget = ({ gameId }: { gameId: string }) => {
	const { data: session } = useSession();
	const [gameState, setGameState] = useState<GameState>();
	const [chess, setChess] = useState<Chess>(new Chess());

	useEffect(() => {
		const handleFetchGame = async () => {
			const res = await fetch(`/api/games/${gameId}`);

			const { game } = await res.json();

			setGameState(convertGameToGameState(game, chess));
			chess.loadPgn(game.pgn)

			console.log(game);
		}

		handleFetchGame();
	}, [gameId])

	if (!gameState || !session) {
		return <div>Loading...</div>
	}

	const isWhiteView = !session ? true : gameState.whitePlayerId === session.user?.id
	const topPlayerColor = isWhiteView ? "b" : "w";
	const bottomPlayerColor = isWhiteView ? "w" : "b";
	const topPlayer = isWhiteView ? gameState.blackPlayerUsername : gameState.whitePlayerUsername;
	const bottomPlayer = isWhiteView ? gameState.whitePlayerUsername : gameState.blackPlayerUsername;
	const topPlayerCapturedPieces: PieceSymbol[] = [];
	const bottomPlayerCapturedPieces: PieceSymbol[] = [];

	const topPlayerMaterialUpBy = 0;
	const bottomPlayerMaterialUpBy = 0;

	const board = chess.board();
	const boardAligned = !isWhiteView
		? board.map(row => row.toReversed()).reverse()
		: board;

	const selectedSquare = null;

	const turn = chess.turn();

	const selectedLegalSquares: Square[] = [];
	const selectedCapturableSquares: Square[] = [];

	const handlePieceClick = (square: Square) => {
		return;
	}


	return (
		<div className="flex h-full w-full flex-col gap-2 items-center">
			<div className="w-[min(76vh,95vw)] h-auto flex flex-col gap-2">
				<CapturedPiecesWidget
					capturedPieces={topPlayerCapturedPieces}
					color={bottomPlayerColor}
					name={topPlayer}
					material={topPlayerMaterialUpBy !== 0 ? topPlayerMaterialUpBy : ""}
				/>
				<div className="size-full flex justify-center">
					<BoardPlayspace
						gameState={gameState}
						boardAligned={boardAligned}
						isWhiteView={isWhiteView}
						selectedSquare={selectedSquare}
						turn={turn}
						selectedLegalSquares={selectedLegalSquares}
						selectedCapturableSquares={selectedCapturableSquares}
						handlePieceClick={handlePieceClick}
					/>
				</div>
				<CapturedPiecesWidget
					capturedPieces={bottomPlayerCapturedPieces}
					color={topPlayerColor}
					name={bottomPlayer}
					material={bottomPlayerMaterialUpBy !== 0 ? bottomPlayerMaterialUpBy : ""}
				/>
			</div>
		</div>
	)
}
export default GameReviewWidget