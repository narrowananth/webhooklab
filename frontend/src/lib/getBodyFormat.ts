import type { WebhookEvent } from "@/types";

export type BodyFormat =
	| "json"
	| "graphql"
	| "xml"
	| "soap"
	| "html"
	| "form-urlencoded"
	| "form-data"
	| "text"
	| "binary"
	| "unknown";

export type BodyFormatInfo = {
	format: BodyFormat;
	contentType: string;
	label: string;
	extension: string;
	mimeType: string;
};

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
	return lower.includes("soap") || lower.includes("envelope") || /<\w*:?envelope/i.test(raw);
}

function looksLikeHtml(raw: string | null): boolean {
	if (!raw?.trim()) return false;
	return (
		/^\s*<!DOCTYPE\s/i.test(raw) || /^\s*<html[\s>]/i.test(raw) || /^\s*<head[\s>]/i.test(raw)
	);
}

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

	if (ct.includes("xml") || ct.includes("soap") || looksLikeXml(raw) || looksLikeSoap(raw)) {
		const isSoap = ct.includes("soap") || looksLikeSoap(raw);
		return {
			format: isSoap ? "soap" : "xml",
			contentType: ct || "application/xml",
			label: isSoap ? "SOAP" : "XML",
			extension: "xml",
			mimeType: ct || "application/xml",
		};
	}

	if (ct.includes("x-www-form-urlencoded")) {
		return {
			format: "form-urlencoded",
			contentType: ct,
			label: "Form (URL-encoded)",
			extension: "txt",
			mimeType: "application/x-www-form-urlencoded",
		};
	}

	if (ct.includes("multipart/form-data")) {
		return {
			format: "form-data",
			contentType: ct,
			label: "Form (multipart)",
			extension: "txt",
			mimeType: "multipart/form-data",
		};
	}

	if (ct.includes("application/graphql")) {
		return {
			format: "graphql",
			contentType: ct,
			label: "GraphQL",
			extension: "graphql",
			mimeType: "application/graphql",
		};
	}

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

	if (ct.includes("text/html") || looksLikeHtml(raw)) {
		return {
			format: "html",
			contentType: ct || "text/html",
			label: "HTML",
			extension: "html",
			mimeType: ct || "text/html",
		};
	}

	// JavaScript / ECMAScript
	if (
		ct.includes("application/javascript") ||
		ct.includes("text/javascript") ||
		ct.includes("application/ecmascript") ||
		ct.includes("text/ecmascript")
	) {
		return {
			format: "text",
			contentType: ct || "application/javascript",
			label: "JavaScript",
			extension: "js",
			mimeType: ct || "application/javascript",
		};
	}

	// CSS
	if (ct.includes("text/css")) {
		return {
			format: "text",
			contentType: ct,
			label: "CSS",
			extension: "css",
			mimeType: ct || "text/css",
		};
	}

	// YAML
	if (
		ct.includes("application/yaml") ||
		ct.includes("text/yaml") ||
		ct.includes("application/x-yaml") ||
		ct.includes("text/x-yaml")
	) {
		return {
			format: "text",
			contentType: ct || "application/yaml",
			label: "YAML",
			extension: "yml",
			mimeType: ct || "application/yaml",
		};
	}

	// SVG (treat as XML for pretty-print)
	if (ct.includes("image/svg+xml")) {
		return {
			format: "xml",
			contentType: ct,
			label: "SVG",
			extension: "svg",
			mimeType: ct || "image/svg+xml",
		};
	}

	// Plain text and other text/* types
	if (ct.includes("text/plain") || ct.startsWith("text/")) {
		const subtype = ct.split("/")[1]?.split(";")[0]?.toUpperCase() ?? "Text";
		return {
			format: "text",
			contentType: ct,
			label: subtype,
			extension: "txt",
			mimeType: ct || "text/plain",
		};
	}

	// Binary / octet-stream
	if (ct.includes("application/octet-stream") || ct.includes("binary")) {
		return {
			format: "binary",
			contentType: ct || "application/octet-stream",
			label: "Binary",
			extension: "bin",
			mimeType: ct || "application/octet-stream",
		};
	}

	// Any other application/* with no match: treat as text for display
	if (
		ct.startsWith("application/") ||
		ct.startsWith("image/") ||
		ct.startsWith("audio/") ||
		ct.startsWith("video/")
	) {
		const subtype = ct.split("/")[1]?.split(";")[0] ?? "unknown";
		return {
			format: "text",
			contentType: ct,
			label: subtype.replace(/^x-/, "").toUpperCase(),
			extension: "txt",
			mimeType: ct,
		};
	}

	return defaults;
}
