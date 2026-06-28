import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum(
	"game_status",
	["active", "finished"]
);

export const gameWinnerEnum = pgEnum(
	"game_winner",
	["w", "b", "draw"]
);

export const gameResultEnum = pgEnum(
	"game_result",
	[
		"",
		"checkmate",
		"stalemate",
		"draw",
		"resignation",
		"threefold",
		"insufficient"
	]
);

export const gameColorEnum = pgEnum(
	"game_color",
	["w", "b", ""]
);


export const gamesTable = pgTable(
	"games",
	{
		id: text("id").primaryKey(),

		whitePlayerId: text("white_player_id").notNull(),
		blackPlayerId: text("black_player_id").notNull(),

		whitePlayerUsername: text("white_player_username").notNull(),
		blackPlayerUsername: text("black_player_username").notNull(),

		fen: text("fen").notNull(),
		pgn: text("pgn").notNull(),

		status: gameStatusEnum("status")
			.notNull()
			.default("active"),

		winner: gameWinnerEnum("winner"),

		resignedBy: gameColorEnum("resigned_by"),

		result: gameResultEnum("result"),

		startedAt: timestamp("started_at")
			.defaultNow()
			.notNull(),

		endedAt: timestamp("ended_at"),
	},
	(table) => [
		index("games_white_player_idx")
			.on(table.whitePlayerId),

		index("games_black_player_idx")
			.on(table.blackPlayerId),
	]
);