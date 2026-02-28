import type { WebhookEvent } from "../types";

/**
 * Get content-type from event headers (case-insensitive).
 * Falls back to application/json if body exists, else application/octet-stream.
 */
export function getContentType(event: WebhookEvent): string {
	const headers = event.headers ?? {};
	const key = Object.keys(headers).find((k) => k.toLowerCase() === "content-type");
	if (key && headers[key]) return headers[key];
	if (event.body || event.rawBody) return "application/json";
	return "application/octet-stream";
}
