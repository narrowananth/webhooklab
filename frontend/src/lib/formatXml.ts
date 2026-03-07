export function formatXml(xml: string): string {
	const trimmed = xml.trim();
	if (!trimmed) return xml;

	let result = "";
	let indent = 0;
	const tab = "  ";

	const collapsed = trimmed.replace(/>\s+</g, "><");
	const parts = collapsed.split(/(<[^>]+>)/);

	for (const part of parts) {
		if (!part) continue;

		const isClosing = /^<\s*\/\s*[\w-:]+/.test(part);
		const isSelfClosing = /\/\s*>$/.test(part) || part.endsWith("?>");
		const isOpening = /^<\s*[\w-:]+/.test(part) && !isClosing && !isSelfClosing;

		if (isClosing) {
			indent = Math.max(0, indent - 1);
			result += `${tab.repeat(indent) + part}\n`;
		} else if (isSelfClosing || part.startsWith("<?")) {
			result += `${tab.repeat(indent) + part}\n`;
		} else if (isOpening) {
			result += `${tab.repeat(indent) + part}\n`;
			indent++;
		} else if (part.trim()) {
			result += `${tab.repeat(indent) + part}\n`;
		}
	}

	return result.trim();
}
