import { index, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./userSchema";
import { relations } from "drizzle-orm";

export const friendRequestStatusEnum = pgEnum(
	"friend_request_status",
	["pending", "accepted", "declined"]
);

export const friendRequests = pgTable(
	"friend_requests",
	{
		id: text("id").primaryKey(),

		fromUserId: text("from_user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		toUserId: text("to_user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		status: friendRequestStatusEnum("status")
			.notNull()
			.default("pending"),

		createdAt: timestamp("created_at")
			.defaultNow()
			.notNull(),

		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("friend_requests_from_idx").on(table.fromUserId),
		index("friend_requests_to_idx").on(table.toUserId),

		uniqueIndex("friend_request_unique")
			.on(table.fromUserId, table.toUserId)
	]
);

export const friends = pgTable(
	"friends",
	{
		user1Id: text("user1_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		user2Id: text("user2_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		createdAt: timestamp("created_at")
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.user1Id, table.user2Id],
		}),

		index("friends_user1_idx").on(table.user1Id),

		index("friends_user2_idx").on(table.user2Id),
	]
);

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
	fromUser: one(users, {
		fields: [friendRequests.fromUserId],
		references: [users.id],
		relationName: "friendRequestFromUser",
	}),
	toUser: one(users, {
		fields: [friendRequests.toUserId],
		references: [users.id],
		relationName: "friendRequestToUser",
	}),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
	user1: one(users, {
		fields: [friends.user1Id],
		references: [users.id],
		relationName: "friendUser1",
	}),
	user2: one(users, {
		fields: [friends.user2Id],
		references: [users.id],
		relationName: "friendUser2",
	}),
}));