/** Extract path from full URL for display (e.g. /api/v1/payments/webh...) */
export function getPathFromUrl(url: string): string {
	try {
		const u = new URL(url);
		return u.pathname + u.search;
	} catch {
		return url;
	}
}

/** Truncate path for mobile display */
export function truncatePath(path: string, maxLen = 28): string {
	if (path.length <= maxLen) return path;
	return path.slice(0, maxLen - 3) + "...";
}
