import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const friendRequestStatusEnum = pgEnum(
	"friend_request_status",
	["pending", "accepted", "declined"]
);

export const friendRequests = pgTable(
	"friend_requests",
	{
		id: text("id").primaryKey(),

		fromUserId: text("from_user_id").notNull(),

		toUserId: text("to_user_id").notNull(),

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
		user1Id: text("user1_id").notNull(),

		user2Id: text("user2_id").notNull(),

		createdAt: timestamp("created_at")
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("friends_unique")
			.on(table.user1Id, table.user2Id),

		index("friends_user1_idx")
			.on(table.user1Id),

		index("friends_user2_idx")
			.on(table.user2Id),
	]
);