/**
 * Generate code snippets from WebhookEvent for cURL, Node fetch, Axios, Java.
 */
import type { WebhookEvent } from "../types";

function getBodyString(event: WebhookEvent): string {
	return event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
}

function getHeaders(event: WebhookEvent): Record<string, string> {
	return event.headers ?? {};
}

function buildUrl(event: WebhookEvent): string {
	const q = event.queryParams;
	if (q && Object.keys(q).length > 0) {
		const qs = new URLSearchParams(q as Record<string, string>).toString();
		return `${event.url}${event.url.includes("?") ? "&" : "?"}${qs}`;
	}
	return event.url;
}

export function toCurl(event: WebhookEvent): string {
	const url = buildUrl(event);
	const method = event.method;
	const headers = getHeaders(event);
	const body = getBodyString(event);

	let curl = `curl -X ${method} '${url}'`;
	for (const [k, v] of Object.entries(headers)) {
		curl += ` \\\n  -H '${k}: ${v.replace(/'/g, "'\\''")}'`;
	}
	if (body && ["POST", "PUT", "PATCH"].includes(method)) {
		const escaped = body.replace(/\\/g, "\\\\").replace(/'/g, "'\\''");
		curl += ` \\\n  -d '${escaped}'`;
	}
	return curl;
}

export function toNodeFetch(event: WebhookEvent): string {
	const url = buildUrl(event);
	const method = event.method;
	const headers = getHeaders(event);
	const body = getBodyString(event);

	let code = `fetch('${url}', {\n  method: '${method}',\n  headers: ${JSON.stringify(headers)}`;
	if (body && ["POST", "PUT", "PATCH"].includes(method)) {
		const escaped = body.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
		code += `,\n  body: \`${escaped}\``;
	}
	code += "\n});";
	return code;
}

export function toAxios(event: WebhookEvent): string {
	const url = buildUrl(event);
	const method = event.method.toLowerCase();
	const headers = getHeaders(event);
	const body = getBodyString(event);

	if (["get", "delete"].includes(method)) {
		return `axios.${method}('${url}', {\n  headers: ${JSON.stringify(headers, null, 2)}\n});`;
	}
	const bodyArg = body ? `JSON.parse(\`${body.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`)` : "{}";
	return `axios.${method}('${url}', ${bodyArg}, {\n  headers: ${JSON.stringify(headers, null, 2)}\n});`;
}

export function toJava(event: WebhookEvent): string {
	const url = buildUrl(event);
	const method = event.method;
	const headers = getHeaders(event);
	const body = getBodyString(event);
	const hasBody = body && ["POST", "PUT", "PATCH"].includes(method);

	let builder = `Request.Builder builder = new Request.Builder().url("${url}");\n`;
	for (const [k, v] of Object.entries(headers)) {
		builder += `builder.addHeader("${k}", "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}");\n`;
	}
	const methodMap: Record<string, string> = {
		GET: "get",
		POST: "post",
		PUT: "put",
		PATCH: "patch",
		DELETE: "delete",
		HEAD: "head",
	};
	const okMethod = methodMap[method] ?? "get";
	if (hasBody && ["post", "put", "patch"].includes(okMethod)) {
		const bodyJson = JSON.stringify(body);
		return `OkHttpClient client = new OkHttpClient();
MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
RequestBody body = RequestBody.create(mediaType, ${bodyJson});
${builder}Request request = builder.${okMethod}(body).build();
Response response = client.newCall(request).execute();`;
	}
	return `OkHttpClient client = new OkHttpClient();
${builder}Request request = builder.${okMethod}().build();
Response response = client.newCall(request).execute();`;
}
