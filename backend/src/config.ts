import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().transform(Number).default("4000"),
	DATABASE_URL: z.string().url().optional(),
	POSTGRES_HOST: z.string().default("localhost"),
	POSTGRES_PORT: z.string().transform(Number).default("5432"),
	POSTGRES_USER: z.string().default("admin"),
	POSTGRES_PASSWORD: z.string().default("admin"),
	POSTGRES_DB: z.string().default("webhook"),
	FRONTEND_URL: z.string().default("*"),
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
