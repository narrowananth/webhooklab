import { apiErrorBodySchema } from "./types.ts";

const API = "";

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	const json = await res.json().catch(() => ({}));

	const errorParsed = apiErrorBodySchema.safeParse(json?.error);
	if (errorParsed.success && errorParsed.data) {
		const err = errorParsed.data;
		const message = err.message ?? err.detail ?? res.statusText ?? "Request failed";
		throw new Error(message);
	}

	if (!res.ok) {
		const fallback = apiErrorBodySchema.safeParse(json?.error);
		const msg =
			fallback.success && fallback.data
				? (fallback.data.message ?? fallback.data.detail)
				: (res.statusText ?? "Request failed");
		throw new Error(String(msg));
	}

	const data = json?.data;
	if (data !== undefined && data !== null) return data as T;
	return json as T;
}

export function apiUrl(path: string): string {
	return `${API}${path}`;
}

export function normalizeEvent<
	T extends { timestamp?: string; createdAt?: string; created_at?: string },
>(e: T): T {
	const ts = e.timestamp ?? e.createdAt ?? e.created_at;
	if (ts) return { ...e, timestamp: ts };
	return e;
}
