import { sql } from "drizzle-orm";
import { closeDatabase, db } from "./db/index.js";

export { db };
export * from "./db/schema.js";
export { closeDatabase };

export async function initDatabase(): Promise<void> {
	await db.execute(sql`SELECT 1`);
	console.log("[DB] Database connected (Drizzle ORM)");
}
