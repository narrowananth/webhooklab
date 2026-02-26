import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { databaseUrl } from "../config.js";
import * as schema from "./schema.js";

export const pool = new pg.Pool({
	connectionString: databaseUrl,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
export * from "./schema.js";

export async function closeDatabase(): Promise<void> {
	await pool.end();
}
