CREATE TYPE "public"."game_color" AS ENUM('w', 'b', '');--> statement-breakpoint
CREATE TYPE "public"."game_result" AS ENUM('', 'checkmate', 'stalemate', 'draw', 'resignation', 'threefold', 'insufficient');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('active', 'finished');--> statement-breakpoint
CREATE TYPE "public"."game_winner" AS ENUM('w', 'b', 'draw');--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"white_player_id" text NOT NULL,
	"black_player_id" text NOT NULL,
	"white_player_username" text NOT NULL,
	"black_player_username" text NOT NULL,
	"fen" text NOT NULL,
	"pgn" text NOT NULL,
	"status" "game_status" DEFAULT 'active' NOT NULL,
	"winner" "game_winner",
	"resigned_by" "game_color",
	"result" "game_result",
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "games_white_player_idx" ON "games" USING btree ("white_player_id");--> statement-breakpoint
CREATE INDEX "games_black_player_idx" ON "games" USING btree ("black_player_id");