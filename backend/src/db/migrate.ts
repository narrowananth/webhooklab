import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { databaseUrl } from "../config.js";

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

const migrationsFolder = resolve(process.cwd(), "drizzle");
await migrate(db, { migrationsFolder });
console.log("[DB] Migrations applied");
await pool.end();
