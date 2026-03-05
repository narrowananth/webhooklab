/** Get display timestamp from event (backend may send timestamp, createdAt, or created_at). */
export function getEventTimestamp(
	event: { timestamp?: string; createdAt?: string; created_at?: string },
): string | undefined {
	return event.timestamp ?? event.createdAt ?? event.created_at;
}

/** Format timestamp as relative time (e.g. "2m ago", "1h ago"). Safe for undefined/null/invalid dates. */
export function formatRelativeTime(date: Date | string | null | undefined): string {
	if (date == null) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	const time = d.getTime();
	if (Number.isNaN(time)) return "—";
	const now = new Date();
	const diffMs = now.getTime() - time;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHr / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHr < 24) return `${diffHr}h ago`;
	if (diffDay < 7) return `${diffDay}d ago`;
	return d.toLocaleDateString();
}
