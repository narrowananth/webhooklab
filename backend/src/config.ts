import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	PORT: z.string().transform(Number),
	DATABASE_URL: z.string().url().optional(),
	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.string().transform(Number),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_DB: z.string(),
	FRONTEND_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("[Config] Invalid environment variables:", parsed.error.flatten());
	process.exit(1);
}

export const config = parsed.data;

export const databaseUrl =
	config.DATABASE_URL ??
	`postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`;
