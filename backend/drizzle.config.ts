import { defineConfig } from "drizzle-kit";

const databaseUrl =
	process.env.DATABASE_URL ??
	`postgresql://${process.env.POSTGRES_USER ?? "admin"}:${process.env.POSTGRES_PASSWORD ?? "admin"}@${process.env.POSTGRES_HOST ?? "localhost"}:${process.env.POSTGRES_PORT ?? "5432"}/${process.env.POSTGRES_DB ?? "webhook"}`;

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url: databaseUrl },
});
