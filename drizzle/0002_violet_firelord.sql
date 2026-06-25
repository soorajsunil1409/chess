ALTER TABLE "games" ALTER COLUMN "resigned_by" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."game_color";--> statement-breakpoint
CREATE TYPE "public"."game_color" AS ENUM('w', 'b');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "resigned_by" SET DATA TYPE "public"."game_color" USING "resigned_by"::"public"."game_color";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "result" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."game_result";--> statement-breakpoint
CREATE TYPE "public"."game_result" AS ENUM('checkmate', 'stalemate', 'draw', 'resignation');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "result" SET DATA TYPE "public"."game_result" USING "result"::"public"."game_result";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "winner" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."game_winner";--> statement-breakpoint
CREATE TYPE "public"."game_winner" AS ENUM('w', 'b', 'draw');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "winner" SET DATA TYPE "public"."game_winner" USING "winner"::"public"."game_winner";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "winner" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "winner" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "resigned_by" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "resigned_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "result" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "result" DROP NOT NULL;