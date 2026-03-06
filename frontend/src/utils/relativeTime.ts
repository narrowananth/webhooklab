/** Get display timestamp from event (backend may send timestamp, createdAt, or created_at). */
export function getEventTimestamp(event: {
	timestamp?: string | number;
	createdAt?: string | number;
	created_at?: string | number;
}): string | number | undefined {
	return event.timestamp ?? event.createdAt ?? event.created_at;
}

/**
 * Parse a date string/number into a Date. Handles backend formats like "2026-03-06 01:12:09.076316"
 * (space instead of T, optional 6-digit fractional seconds) that new Date() can reject.
 */
export function parseDate(value: Date | string | number | null | undefined): Date | null {
	if (value == null) return null;
	if (value instanceof Date) return value;
	if (typeof value === "number") return new Date(value);
	if (typeof value !== "string") return null;
	// Normalize Java LocalDateTime-style: "yyyy-MM-dd HH:mm:ss.ffffff" → ISO-like for JS
	const trimmed = value.trim();
	const normalized = trimmed.replace(
		/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(\.\d+)?/,
		(_, date, time, frac) => {
			const ms = frac ? frac.slice(0, 4) : ""; // at most .123 (ms)
			return `${date}T${time}${ms}`;
		},
	);
	let d = new Date(normalized);
	if (Number.isNaN(d.getTime()) && normalized !== trimmed) d = new Date(trimmed);
	return Number.isNaN(d.getTime()) ? null : d;
}

/** Format timestamp as relative time (e.g. "2m ago", "1h ago"). Safe for undefined/null/invalid dates. */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
	const d = parseDate(date);
	if (d == null) return "—";
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
