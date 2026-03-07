import type { WebhookEvent } from "@/types";

export function getRequestSizeBytes(event: WebhookEvent): number {
	const str = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	return new Blob([str]).size;
}

export { formatSize } from "./formatSize";
