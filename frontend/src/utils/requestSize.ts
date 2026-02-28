import type { WebhookEvent } from "../types";

export function getRequestSizeBytes(event: WebhookEvent): number {
	const str = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	return new Blob([str]).size;
}

export function formatSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
