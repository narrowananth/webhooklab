import {
	clearEvents,
	createWebhook,
	getEvent,
	getEventStats,
	getEvents,
	getWebhookByIdOrSlug,
	searchEvents,
} from "@/api";
import type { SearchEventsParams } from "@/types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const webhookKeys = {
	all: ["webhooks"] as const,
	detail: (id: string) => [...webhookKeys.all, id] as const,
};

export const eventKeys = {
	all: (inboxId: string) => ["events", inboxId] as const,
	stats: (inboxId: string) => [...eventKeys.all(inboxId), "stats"] as const,
	detail: (inboxId: string, eventId: number) => [...eventKeys.all(inboxId), eventId] as const,
	search: (inboxId: string, params: SearchEventsParams) =>
		[
			"events",
			inboxId,
			"search",
			params.search,
			params.method,
			params.status,
			params.ip,
			params.requestId,
			params.page ?? 1,
			params.limit ?? 20,
		] as const,
};

export function useWebhookQuery(webhookId: string | undefined) {
	return useQuery({
		queryKey: webhookKeys.detail(webhookId ?? ""),
		queryFn: () => getWebhookByIdOrSlug(webhookId as string),
		enabled: !!webhookId,
	});
}

export function useEventsQuery(inboxId: string | undefined, page = 1, limit = 50) {
	return useQuery({
		queryKey: [...eventKeys.all(inboxId ?? ""), page, limit],
		queryFn: () => getEvents(inboxId as string, page, limit),
		enabled: !!inboxId,
		placeholderData: keepPreviousData,
	});
}

export function useSearchEventsQuery(
	inboxId: string | undefined,
	params: SearchEventsParams,
	enabled: boolean,
) {
	return useQuery({
		queryKey: eventKeys.search(inboxId ?? "", params),
		queryFn: () => searchEvents(inboxId as string, params),
		enabled: !!inboxId && enabled,
		placeholderData: keepPreviousData,
	});
}

export function useEventStatsQuery(inboxId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: eventKeys.stats(inboxId ?? ""),
		queryFn: () => getEventStats(inboxId as string),
		enabled: !!inboxId && enabled,
	});
}

export function useEventQuery(inboxId: string | undefined, eventId: number | undefined) {
	return useQuery({
		queryKey: eventKeys.detail(inboxId ?? "", eventId ?? 0),
		queryFn: () => getEvent(inboxId as string, eventId as number),
		enabled: !!inboxId && !!eventId,
	});
}

export function useClearEventsMutation(inboxId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => clearEvents(inboxId as string),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventKeys.all(inboxId ?? "") });
			queryClient.invalidateQueries({ queryKey: eventKeys.stats(inboxId ?? "") });
			queryClient.setQueryData(eventKeys.stats(inboxId ?? ""), {
				count: 0,
				totalSize: 0,
			});
		},
	});
}

export function useCreateWebhookMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (opts?: { name?: string; slug?: string }) => createWebhook(opts),
		onSuccess: (data) => {
			queryClient.setQueryData(webhookKeys.detail(String(data.id)), data);
			queryClient.invalidateQueries({ queryKey: webhookKeys.all });
		},
	});
}
