import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { friendRequests, friends } from "./friendsSchema";

export const users = pgTable("users", {
	id: text("id").primaryKey(),

	email: text("email")
		.notNull()
		.unique(),

	username: text("username")
		.notNull()
		.unique(),

	passwordHash: text("password_hash")
		.notNull(),

	createdAt: timestamp("created_at")
		.defaultNow()
		.notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	sentFriendRequests: many(friendRequests, {
		relationName: "friendRequestFromUser",
	}),

	receivedFriendRequests: many(friendRequests, {
		relationName: "friendRequestToUser",
	}),

	friendsAsUser1: many(friends, {
		relationName: "friendUser1",
	}),

	friendsAsUser2: many(friends, {
		relationName: "friendUser2",
	}),
}));