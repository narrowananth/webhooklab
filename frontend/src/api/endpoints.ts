import type { EventsResponse, SearchEventsParams, WebhookEvent, WebhookInbox } from "@/types";
import { webhookEventSchema } from "@/types";
import { apiUrl, normalizeEvent, request } from "./client";

type PaginatedData<T> = {
	content: T[];
	pagination: {
		page: number;
		size: number;
		totalElements: number;
		totalPages: number;
	};
};

function toEventsResponse(payload: PaginatedData<WebhookEvent>): EventsResponse {
	const p = payload.pagination;
	const content = (payload.content ?? []).map((e) => normalizeEvent(e) as WebhookEvent);
	return {
		events: content,
		nextPageToken: null,
		total: p?.totalElements ?? 0,
		pagination: p
			? {
					page: p.page,
					limit: p.size,
					total: p.totalElements,
					totalPages: p.totalPages,
				}
			: undefined,
	};
}

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createWebhook(opts?: {
	name?: string;
	slug?: string;
}): Promise<WebhookInbox & { url: string; slug?: string }> {
	const data = await request<WebhookInbox & { url: string; slug?: string }>(
		apiUrl("/webhooks/create"),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: opts?.name, slug: opts?.slug }),
		},
	);
	return data as WebhookInbox & { url: string; slug?: string };
}

export async function getWebhook(id: string): Promise<WebhookInbox> {
	return request<WebhookInbox>(apiUrl(`/webhooks/${id}`));
}

export async function getWebhookBySlug(slug: string): Promise<WebhookInbox> {
	return request<WebhookInbox>(apiUrl(`/webhooks/by-slug/${encodeURIComponent(slug)}`));
}

export async function getWebhookByIdOrSlug(idOrSlug: string): Promise<WebhookInbox> {
	if (UUID_REGEX.test(idOrSlug)) {
		return getWebhook(idOrSlug);
	}
	return getWebhookBySlug(idOrSlug);
}

export async function getEvents(inboxId: string, page = 1, limit = 25): Promise<EventsResponse> {
	const params = new URLSearchParams({ page: String(page), size: String(limit) });
	const payload = await request<PaginatedData<WebhookEvent>>(
		apiUrl(`/events/${inboxId}?${params}`),
	);
	return toEventsResponse(payload);
}

export async function searchEvents(
	inboxId: string,
	opts: SearchEventsParams,
): Promise<EventsResponse> {
	const params = new URLSearchParams();
	if (opts.search) params.set("search", opts.search);
	if (opts.method) params.set("method", opts.method);
	if (opts.status) params.set("status", opts.status);
	if (opts.ip) params.set("ip", opts.ip);
	if (opts.requestId != null) params.set("requestId", String(opts.requestId));
	params.set("page", String(opts.page ?? 1));
	params.set("size", String(opts.limit ?? 25));
	const payload = await request<PaginatedData<WebhookEvent>>(
		apiUrl(`/events/${inboxId}?${params}`),
	);
	return toEventsResponse(payload);
}

export async function getEvent(inboxId: string, eventId: number): Promise<WebhookEvent> {
	const data = await request<WebhookEvent>(apiUrl(`/events/${inboxId}/${eventId}`));
	return webhookEventSchema.parse(normalizeEvent(data)) as WebhookEvent;
}

export async function getEventStats(
	inboxId: string,
): Promise<{ count: number; totalSize: number }> {
	return request<{ count: number; totalSize: number }>(apiUrl(`/events/${inboxId}/stats`));
}

export async function clearEvents(inboxId: string): Promise<{ cleared?: boolean }> {
	await request<unknown>(apiUrl(`/events/${inboxId}`), { method: "DELETE" });
	return { cleared: true };
}

export async function replayEvent(
	eventId: number,
	targetUrl: string,
): Promise<{ status: number; statusText: string; ok: boolean }> {
	return request<{ status: number; statusText: string; ok: boolean }>(
		apiUrl(`/events/${eventId}/replay`),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ targetUrl }),
		},
	);
}
