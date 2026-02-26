/**
 * WebhookLab API client.
 * All endpoints used by TanStack Query hooks.
 */
import type { EventsResponse, WebhookEvent, WebhookInbox } from "./types";

const API = "/api";

export async function createWebhook(
	opts?: { name?: string; slug?: string },
): Promise<WebhookInbox & { url: string; slug?: string }> {
	const res = await fetch(`${API}/webhooks/create`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: opts?.name, slug: opts?.slug }),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function getWebhook(id: string): Promise<WebhookInbox> {
	const res = await fetch(`${API}/webhooks/${id}`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function getWebhookBySlug(slug: string): Promise<WebhookInbox> {
	const res = await fetch(`${API}/webhooks/by-slug/${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function getEvents(
	inboxId: string,
	page = 1,
	limit = 50,
): Promise<EventsResponse> {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	const res = await fetch(`${API}/events/${inboxId}?${params}`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function getEvent(
	inboxId: string,
	eventId: number,
): Promise<WebhookEvent> {
	const res = await fetch(`${API}/events/${inboxId}/${eventId}`);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function clearEvents(inboxId: string): Promise<{ cleared: boolean }> {
	const res = await fetch(`${API}/events/${inboxId}`, { method: "DELETE" });
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function replayEvent(
	eventId: number,
	targetUrl: string,
): Promise<{ status: number; statusText: string; ok: boolean }> {
	const res = await fetch(`${API}/events/${eventId}/replay`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ targetUrl }),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}
