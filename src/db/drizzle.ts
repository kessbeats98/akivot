import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// DB client is created lazily at call time, not at import time.
// DATABASE_URL is only read when getDb() is called (inside a request handler).
// This keeps the build safe when env vars are absent.
// TODO TASK-02: activate after schema is populated and DATABASE_URL is set.
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export type DB = ReturnType<typeof getDb>;
