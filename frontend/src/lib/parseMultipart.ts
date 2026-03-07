/**
 * Parse multipart/form-data body using boundary from Content-Type header.
 * Returns an array of parts with name, optional filename, optional contentType, and value.
 */
export type MultipartPart = {
	name: string;
	filename?: string;
	contentType?: string;
	value: string;
};

function getBoundary(contentTypeHeader: string): string | null {
	const match = contentTypeHeader.match(/\bboundary=([^;\s]+)/i);
	if (!match) return null;
	return match[1].replace(/^["']|["']$/g, "").trim();
}

export function parseMultipart(raw: string, contentTypeHeader: string): MultipartPart[] {
	const boundary = getBoundary(contentTypeHeader);
	if (!boundary || !raw) return [];

	const boundaryStr = `--${boundary}`;
	const parts: MultipartPart[] = [];
	const segments = raw.split(boundaryStr);

	for (const segment of segments) {
		const trimmed = segment.trim();
		if (!trimmed || trimmed === "--") continue;

		const headerEnd = trimmed.indexOf("\n\n");
		const headerEndCr = trimmed.indexOf("\r\n\r\n");
		const end =
			headerEnd >= 0 && (headerEndCr < 0 || headerEnd < headerEndCr)
				? headerEnd
				: headerEndCr;
		if (end < 0) continue;

		const headerBlock = trimmed.slice(0, end);
		const body = trimmed
			.slice(trimmed[end + 2] === "\r" ? end + 4 : end + 2)
			.replace(/\r\n/g, "\n")
			.trim();
		const value = body.endsWith("--") ? body.slice(0, -2).trim() : body;

		let name = "";
		let filename: string | undefined;
		let contentType: string | undefined;

		const headerLines = headerBlock.split(/\r?\n/);
		for (const line of headerLines) {
			const colon = line.indexOf(":");
			if (colon < 0) continue;
			const key = line.slice(0, colon).trim().toLowerCase();
			const val = line.slice(colon + 1).trim();
			if (key === "content-disposition") {
				const nameMatch = val.match(/\bname="([^"]+)"/i);
				if (nameMatch) name = nameMatch[1];
				const fileMatch = val.match(/\bfilename="([^"]*)"/i);
				if (fileMatch) filename = fileMatch[1] || undefined;
			} else if (key === "content-type") {
				contentType = val.split(";")[0].trim();
			}
		}

		parts.push({ name, filename, contentType, value });
	}

	return parts;
}
