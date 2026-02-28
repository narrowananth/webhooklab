/**
 * Highlight search term in text. Escapes HTML and wraps matches in <mark>.
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str: string): string {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

export function highlightSearch(text: string, term: string): string {
	if (!term?.trim()) return escapeHtml(text);
	const escaped = escapeRegex(term.trim());
	const re = new RegExp(`(${escaped})`, "gi");
	return escapeHtml(text).replace(re, '<mark class="search-highlight">$1</mark>');
}
