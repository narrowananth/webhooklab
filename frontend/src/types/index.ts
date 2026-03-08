import { z } from "zod";

export const webhookInboxSchema = z.object({
	id: z.string(),
	slug: z.string().nullable().optional(),
	url: z.string(),
	createdAt: z.string().optional(),
});

export type WebhookInbox = z.infer<typeof webhookInboxSchema>;

export const webhookEventSchema = z.object({
	id: z.number(),
	method: z.string(),
	url: z.string(),
	headers: z.record(z.string()).default({}),
	queryParams: z.record(z.string()).default({}),
	body: z.record(z.unknown()).nullable().default(null),
	rawBody: z.string().nullable().default(null),
	ip: z.string().nullable().default(null),
	status: z.number().optional(),
	timestamp: z.string().optional(),
	createdAt: z.string().optional(),
});

export type WebhookEvent = z.infer<typeof webhookEventSchema>;

export const eventsResponseSchema = z.object({
	events: z.array(webhookEventSchema),
	nextPageToken: z.string().nullable(),
	total: z.number(),
	pagination: z
		.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		})
		.optional(),
});

export type EventsResponse = z.infer<typeof eventsResponseSchema>;

export const searchEventsParamsSchema = z.object({
	search: z.string().optional(),
	method: z.string().optional(),
	status: z.string().optional(),
	ip: z.string().optional(),
	requestId: z.number().optional(),
	page: z.number().optional(),
	limit: z.number().optional(),
});

export type SearchEventsParams = z.infer<typeof searchEventsParamsSchema>;

export const themeModeSchema = z.enum(["light", "dark"]);
export type ThemeMode = z.infer<typeof themeModeSchema>;

export const detailTabSchema = z.enum(["pretty", "raw", "headers", "query"]);
export type DetailTab = z.infer<typeof detailTabSchema>;

export const activeNavSchema = z.enum(["requests", "endpoints", "metrics", "settings"]);
export type ActiveNav = z.infer<typeof activeNavSchema>;
