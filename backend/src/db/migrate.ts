import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { databaseUrl } from "../config.js";

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

const migrationsFolder = resolve(fileURLToPath(import.meta.url), "../../drizzle");
await migrate(db, { migrationsFolder });
console.log("[DB] Migrations applied");
await pool.end();
