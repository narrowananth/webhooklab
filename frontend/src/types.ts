export interface WebhookInbox {
	id: string;
	slug?: string | null;
	url: string;
	name: string | null;
	createdAt?: string;
}

export interface WebhookEvent {
	id: number;
	method: string;
	url: string;
	headers: Record<string, string>;
	queryParams: Record<string, string>;
	body: Record<string, unknown> | null;
	rawBody: string | null;
	ip: string | null;
	timestamp: string;
}

export interface EventsResponse {
	events: WebhookEvent[];
	nextPageToken: string | null;
	total: number;
}
