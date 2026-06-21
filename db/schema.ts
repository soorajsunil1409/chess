import {
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

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