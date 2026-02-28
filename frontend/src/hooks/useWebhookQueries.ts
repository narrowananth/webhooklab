/**
 * TanStack Query hooks for WebhookLab API calls.
 * Handles caching, background refetching, and invalidation.
 */
import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	clearEvents,
	getEvent,
	getEvents,
	getEventStats,
	getWebhook,
	searchEvents,
} from "../api";
import type { SearchEventsParams } from "../types";

/** Query keys for cache invalidation */
export const webhookKeys = {
	all: ["webhooks"] as const,
	detail: (id: string) => [...webhookKeys.all, id] as const,
};

export const eventKeys = {
	all: (inboxId: string) => ["events", inboxId] as const,
	stats: (inboxId: string) => [...eventKeys.all(inboxId), "stats"] as const,
	detail: (inboxId: string, eventId: number) =>
		[...eventKeys.all(inboxId), eventId] as const,
	search: (inboxId: string, params: SearchEventsParams) =>
		[
			"events",
			inboxId,
			"search",
			params.search,
			params.method,
			params.ip,
			params.requestId,
			params.page ?? 1,
			params.limit ?? 20,
		] as const,
};

/** Fetch webhook inbox details */
export function useWebhookQuery(webhookId: string | undefined) {
	return useQuery({
		queryKey: webhookKeys.detail(webhookId ?? ""),
		queryFn: () => getWebhook(webhookId!),
		enabled: !!webhookId,
	});
}

/** Fetch events list with pagination */
export function useEventsQuery(inboxId: string | undefined, page = 1, limit = 50) {
	return useQuery({
		queryKey: [...eventKeys.all(inboxId ?? ""), page, limit],
		queryFn: () => getEvents(inboxId!, page, limit),
		enabled: !!inboxId,
	});
}

/** Fetch events with search/filters (server-side) when filters are active */
export function useSearchEventsQuery(
	inboxId: string | undefined,
	params: SearchEventsParams,
	enabled: boolean,
) {
	return useQuery({
		queryKey: eventKeys.search(inboxId ?? "", params),
		queryFn: () => searchEvents(inboxId!, params),
		enabled: !!inboxId && enabled,
	});
}

/** Fetch event stats (count, totalSize) for an inbox */
export function useEventStatsQuery(inboxId: string | undefined) {
	return useQuery({
		queryKey: eventKeys.stats(inboxId ?? ""),
		queryFn: () => getEventStats(inboxId!),
		enabled: !!inboxId,
	});
}

/** Fetch single event (for detail pane when not in list) */
export function useEventQuery(
	inboxId: string | undefined,
	eventId: number | undefined,
) {
	return useQuery({
		queryKey: eventKeys.detail(inboxId ?? "", eventId ?? 0),
		queryFn: () => getEvent(inboxId!, eventId!),
		enabled: !!inboxId && !!eventId,
	});
}

/** Clear all events for an inbox - invalidates events query */
export function useClearEventsMutation(inboxId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => clearEvents(inboxId!),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventKeys.all(inboxId ?? "") });
			queryClient.invalidateQueries({ queryKey: eventKeys.stats(inboxId ?? "") });
		},
	});
}
