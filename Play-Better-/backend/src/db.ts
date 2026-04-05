import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Railway Postgres commonly requires SSL in production.
// This setting is safe for managed Postgres providers.
const ssl =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export const db = drizzle(pool, { schema });
