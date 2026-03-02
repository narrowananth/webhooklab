import type { WebhookEvent } from "../types";

export type BodyFormat =
	| "json"
	| "graphql"
	| "xml"
	| "soap"
	| "form-urlencoded"
	| "form-data"
	| "text"
	| "binary"
	| "unknown";

export interface BodyFormatInfo {
	format: BodyFormat;
	contentType: string;
	/** Human label for UI */
	label: string;
	/** File extension for download */
	extension: string;
	/** Blob MIME for download */
	mimeType: string;
}

function getContentTypeHeader(event: WebhookEvent): string {
	const headers = event.headers ?? {};
	const key = Object.keys(headers).find((k) => k.toLowerCase() === "content-type");
	return key ? (headers[key] ?? "").split(";")[0]?.trim().toLowerCase() : "";
}

function isJsonParsable(raw: string | null): boolean {
	if (!raw?.trim()) return false;
	const t = raw.trim();
	return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

function looksLikeGraphQL(obj: unknown): boolean {
	if (!obj || typeof obj !== "object") return false;
	const o = obj as Record<string, unknown>;
	return "query" in o || "mutation" in o || "operationName" in o;
}

function looksLikeXml(raw: string | null): boolean {
	if (!raw?.trim()) return false;
	return /^\s*<[\w-:]+/.test(raw) || /^\s*<\?xml/.test(raw);
}

function looksLikeSoap(raw: string | null): boolean {
	if (!raw?.trim()) return false;
	const lower = raw.toLowerCase();
	return (
		lower.includes("soap") ||
		lower.includes("envelope") ||
		/<\w*:?envelope/i.test(raw)
	);
}

/**
 * Detect body format from Content-Type and body content.
 * Supports: JSON, GraphQL, XML, SOAP, form-urlencoded, form-data, plain text.
 */
export function getBodyFormat(event: WebhookEvent): BodyFormatInfo {
	const raw = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	const ct = getContentTypeHeader(event);

	const defaults: BodyFormatInfo = {
		format: "unknown",
		contentType: ct || "application/octet-stream",
		label: "Unknown",
		extension: "txt",
		mimeType: ct || "application/octet-stream",
	};

	if (!raw) {
		return { ...defaults, label: "Empty" };
	}

	// XML / SOAP
	if (
		ct.includes("xml") ||
		ct.includes("soap") ||
		looksLikeXml(raw) ||
		looksLikeSoap(raw)
	) {
		const isSoap = ct.includes("soap") || looksLikeSoap(raw);
		return {
			format: isSoap ? "soap" : "xml",
			contentType: ct || "application/xml",
			label: isSoap ? "SOAP" : "XML",
			extension: "xml",
			mimeType: ct || "application/xml",
		};
	}

	// form-urlencoded
	if (ct.includes("x-www-form-urlencoded")) {
		return {
			format: "form-urlencoded",
			contentType: ct,
			label: "Form (URL-encoded)",
			extension: "txt",
			mimeType: "application/x-www-form-urlencoded",
		};
	}

	// multipart/form-data
	if (ct.includes("multipart/form-data")) {
		return {
			format: "form-data",
			contentType: ct,
			label: "Form (multipart)",
			extension: "txt",
			mimeType: "multipart/form-data",
		};
	}

	// application/graphql (raw GraphQL string)
	if (ct.includes("application/graphql")) {
		return {
			format: "graphql",
			contentType: ct,
			label: "GraphQL",
			extension: "graphql",
			mimeType: "application/graphql",
		};
	}

	// JSON / GraphQL
	if (ct.includes("json") || isJsonParsable(raw)) {
		let parsed: unknown = event.body;
		if (!parsed && raw) {
			try {
				parsed = JSON.parse(raw);
			} catch {
				parsed = null;
			}
		}
		const isGraphQL = looksLikeGraphQL(parsed);
		return {
			format: isGraphQL ? "graphql" : "json",
			contentType: ct || "application/json",
			label: isGraphQL ? "GraphQL" : "JSON",
			extension: "json",
			mimeType: ct || "application/json",
		};
	}

	// plain text
	if (ct.includes("text/plain") || ct.includes("text/html") || ct.startsWith("text/")) {
		return {
			format: "text",
			contentType: ct,
			label: ct.split("/")[1]?.toUpperCase() ?? "Text",
			extension: "txt",
			mimeType: ct || "text/plain",
		};
	}

	return defaults;
}
