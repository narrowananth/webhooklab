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
	getWebhook,
} from "../api";

/** Query keys for cache invalidation */
export const webhookKeys = {
	all: ["webhooks"] as const,
	detail: (id: string) => [...webhookKeys.all, id] as const,
};

export const eventKeys = {
	all: (inboxId: string) => ["events", inboxId] as const,
	detail: (inboxId: string, eventId: number) =>
		[...eventKeys.all(inboxId), eventId] as const,
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
		},
	});
}
