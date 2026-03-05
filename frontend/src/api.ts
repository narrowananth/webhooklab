/**
 * WebhookLab API client.
 * All endpoints used by TanStack Query hooks.
 * Expects backend response shape: success { data }, error { error: { code, detail, message } }.
 * No /api prefix: backend is at root (e.g. /health, /webhooks, /events). Use proxy in dev.
 */
import type { EventsResponse, SearchEventsParams, WebhookEvent, WebhookInbox } from "./types";

/** Backend at root: /health, /webhooks, /events (proxied to http://localhost:4000 in dev) */
const API = "";

/** Backend error body (Java sample backend) */
export interface ApiErrorBody {
	code: string;
	detail?: string | null;
	message?: string | null;
}

/** Backend success wrapper */
export interface ApiSuccess<T> {
	data: T;
}

/** Backend error wrapper */
export interface ApiErrorResponse {
	error: ApiErrorBody;
}

/** Backend paginated payload (events list) */
interface PaginatedData<T> {
	content: T[];
	pagination: {
		page: number;
		size: number;
		totalElements: number;
		totalPages: number;
	};
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	const json = await res.json().catch(() => ({}));

	if (json?.error) {
		const err = json.error as ApiErrorBody;
		const message = err.message ?? err.detail ?? (res.statusText || "Request failed");
		throw new Error(message);
	}

	if (!res.ok) {
		throw new Error((json?.error as ApiErrorBody)?.message ?? res.statusText ?? "Request failed");
	}

	// Backend wraps success in { data }
	const data = json?.data;
	if (data === undefined && json?.data === undefined) {
		// Allow non-wrapped responses (e.g. legacy Node backend) for backward compatibility
		return json as T;
	}
	return data as T;
}

export async function createWebhook(opts?: { name?: string; slug?: string }): Promise<
	WebhookInbox & { url: string; slug?: string }
> {
	const data = await request<WebhookInbox & { url: string; slug?: string }>(
		`${API}/webhooks/create`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: opts?.name, slug: opts?.slug }),
		},
	);
	return data;
}

/** UUID v4 format - used to distinguish UUID from slug in /webhook/:id */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getWebhook(id: string): Promise<WebhookInbox> {
	return request<WebhookInbox>(`${API}/webhooks/${id}`);
}

/** Fetch webhook by UUID or slug (for /webhook/:id routes) */
export async function getWebhookByIdOrSlug(idOrSlug: string): Promise<WebhookInbox> {
	if (UUID_REGEX.test(idOrSlug)) {
		return getWebhook(idOrSlug);
	}
	return getWebhookBySlug(idOrSlug);
}

export async function getWebhookBySlug(slug: string): Promise<WebhookInbox> {
	return request<WebhookInbox>(`${API}/webhooks/by-slug/${encodeURIComponent(slug)}`);
}

function toEventsResponse(payload: PaginatedData<WebhookEvent>): EventsResponse {
	const p = payload.pagination;
	return {
		events: payload.content ?? [],
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

export async function getEvents(inboxId: string, page = 1, limit = 25): Promise<EventsResponse> {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	const payload = await request<PaginatedData<WebhookEvent>>(
		`${API}/events/${inboxId}?${params}`,
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
	params.set("limit", String(opts.limit ?? 25));
	const payload = await request<PaginatedData<WebhookEvent>>(
		`${API}/events/${inboxId}?${params}`,
	);
	return toEventsResponse(payload);
}

export async function getEvent(inboxId: string, eventId: number): Promise<WebhookEvent> {
	return request<WebhookEvent>(`${API}/events/${inboxId}/${eventId}`);
}

export async function getEventStats(
	inboxId: string,
): Promise<{ count: number; totalSize: number }> {
	return request<{ count: number; totalSize: number }>(
		`${API}/events/${inboxId}/stats`,
	);
}

export async function clearEvents(inboxId: string): Promise<{ cleared?: boolean }> {
	await request<unknown>(`${API}/events/${inboxId}`, { method: "DELETE" });
	return { cleared: true };
}

export async function replayEvent(
	eventId: number,
	targetUrl: string,
): Promise<{ status: number; statusText: string; ok: boolean }> {
	return request<{ status: number; statusText: string; ok: boolean }>(
		`${API}/events/${eventId}/replay`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ targetUrl }),
		},
	);
}
