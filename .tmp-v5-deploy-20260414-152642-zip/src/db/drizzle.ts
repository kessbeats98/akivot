import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// DB client is created lazily at call time, not at import time.
// DATABASE_URL is only read when getDb() is called (inside a request handler).
// Uses neon-serverless (WebSocket) driver — supports interactive transactions.
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export type DB = ReturnType<typeof getDb>;
