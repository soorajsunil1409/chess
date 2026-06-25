import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";

dotenv.config({
	path: ".env.local",
});

import * as schema from "./schema"

const queryClient = postgres(
  process.env.DATABASE_URL!
);

export const db = drizzle(queryClient, {
	schema,
});