export function toFullWebhookUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	const path = url.replace(/^\*\/?/, "/");
	return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getPathFromUrl(url: string): string {
	try {
		const u = new URL(url);
		return u.pathname + u.search;
	} catch {
		return url;
	}
}

export function truncatePath(path: string, maxLen = 28): string {
	if (path.length <= maxLen) return path;
	return `${path.slice(0, maxLen - 3)}...`;
}

export function truncateUrlEnd(url: string, maxChars: number): string {
	if (!url || url.length <= maxChars) return url;
	const ellipsis = "...";
	return ellipsis + url.slice(-(maxChars - ellipsis.length));
}
