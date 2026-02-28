/**
 * Format timestamp for display (e.g. "2:30 PM", "Jan 15, 2025").
 */
export function formatTimestamp(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	});
}
