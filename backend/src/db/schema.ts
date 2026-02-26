import {
	bigserial,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const webhooks = pgTable("webhooks", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	webhookId: uuid("webhook_id").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requests = pgTable(
	"requests",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		webhookId: uuid("webhook_id")
			.notNull()
			.references(() => webhooks.webhookId, { onDelete: "cascade" }),
		method: varchar("method", { length: 10 }).notNull(),
		url: text("url").notNull(),
		headers: jsonb("headers").$type<Record<string, string>>().default({}),
		queryParams: jsonb("query_params").$type<Record<string, string>>().default({}),
		body: jsonb("body").$type<Record<string, unknown>>().default({}),
		ip: varchar("ip", { length: 100 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_requests_webhook_id").on(table.webhookId),
		index("idx_requests_created_at").on(table.createdAt),
	],
);

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
