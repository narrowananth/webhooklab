/**
 * Pretty-print HTML with indentation for readability.
 */
export function formatHtml(html: string): string {
	const trimmed = html.trim();
	if (!trimmed) return html;

	let result = "";
	let indent = 0;
	const tab = "  ";

	// Collapse insignificant whitespace between tags
	const collapsed = trimmed.replace(/>\s+</g, "><");
	// Split on tags but keep them
	const parts = collapsed.split(/(<[^>]+>)/);

	for (const part of parts) {
		if (!part) continue;

		const isClosing = /^<\s*\/\s*[\w-:]+/.test(part);
		const isSelfClosing =
			/\/\s*>$/.test(part) ||
			part.endsWith("?>") ||
			/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\s/i.test(
				part,
			);
		const isOpening = /^<\s*[\w-:]+/.test(part) && !isClosing && !isSelfClosing;
		const isDoctype = /^<!DOCTYPE\s/i.test(part) || /^<\?/.test(part);
		const isComment = /^<!--/.test(part);

		if (isClosing) {
			indent = Math.max(0, indent - 1);
			result += `${tab.repeat(indent)}${part}\n`;
		} else if (isSelfClosing || isDoctype || isComment) {
			result += `${tab.repeat(indent)}${part}\n`;
		} else if (isOpening) {
			result += `${tab.repeat(indent)}${part}\n`;
			indent++;
		} else if (part.trim()) {
			result += `${tab.repeat(indent)}${part}\n`;
		}
	}

	return result.trim();
}
