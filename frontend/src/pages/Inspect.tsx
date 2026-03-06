/**
 * Inspect page: header, left request list panel, right inspector, footer.
 * RequestListPanel has search + Method/Status/IP/Request ID filters. Inspector shows selected request.
 * When filters active: server-side search. Otherwise: server-side paginated list (full dataset).
 */
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { InspectHeader } from "../components/inspect/InspectHeader";
import { RequestListPanel } from "../components/inspect/RequestListPanel";
import { InspectMainContent } from "../components/inspect/InspectMainContent";
import { InspectFooter } from "../components/inspect/InspectFooter";
import {
	useWebhookQuery,
	useEventsQuery,
	useSearchEventsQuery,
	useEventStatsQuery,
	useClearEventsMutation,
	eventKeys,
} from "../hooks/useWebhookQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "../hooks/useWebSocket";
import { useInspectStore } from "../store/useInspectStore";
import { toFullWebhookUrl } from "../utils/truncateUrl";
import { UUID_REGEX } from "../api";
import type { WebhookEvent } from "../types";

/** Resolved webhook ID (UUID) for API calls - URL param may be UUID or slug */
function useResolvedWebhookId(
	webhookId: string | undefined,
	webhook: { id: string } | undefined,
): string | undefined {
	if (!webhookId) return undefined;
	if (UUID_REGEX.test(webhookId)) return webhookId;
	return webhook?.id;
}

export function Inspect() {
	const { webhookId } = useParams<{ webhookId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		setSelectedEvent,
		selectedEvent,
		resetFilters,
		searchFilter,
		methodFilter,
		statusFilter,
		ipFilter,
		requestIdFilter,
		pageSize,
		setPageSize,
		isPaused,
	} = useInspectStore();
	const queryClient = useQueryClient();
	const [searchPage, setSearchPage] = useState(1);
	/** Server-side list page when no filters (browse all requests); filters use searchPage */
	const [listPage, setListPage] = useState(1);

	const hasFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		(statusFilter && statusFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	const { data: webhook, isLoading: webhookLoading } = useWebhookQuery(webhookId ?? undefined);
	const resolvedId = useResolvedWebhookId(webhookId ?? undefined, webhook);
	const { data: eventsData, isLoading: eventsLoading, isFetching: eventsFetching } = useEventsQuery(
		resolvedId,
		hasFilters ? 1 : listPage,
		pageSize,
	);
	const clearMutation = useClearEventsMutation(resolvedId);
	const { setEvents, connected } = useWebSocket(resolvedId ?? null);
	const { data: stats, isLoading: statsLoading } = useEventStatsQuery(
		resolvedId,
	);

	const searchQueryParams = {
		search: searchFilter?.trim() || undefined,
		method: methodFilter && methodFilter !== "All" ? methodFilter : undefined,
		status: statusFilter && statusFilter !== "All" ? statusFilter : undefined,
		ip: ipFilter?.trim() || undefined,
		requestId: requestIdFilter ? Number.parseInt(requestIdFilter, 10) : undefined,
		page: searchPage,
		limit: pageSize,
	};

	const { data: searchData, isLoading: searchLoading, isFetching: searchFetching } = useSearchEventsQuery(
		resolvedId,
		searchQueryParams,
		hasFilters,
	);

	useEffect(() => {
		// Keep first page in WS buffer when browsing full list (for potential live merge on page 1)
		if (eventsData?.events && !hasFilters && listPage === 1) setEvents(eventsData.events);
	}, [eventsData?.events, hasFilters, listPage, setEvents]);

	// When resuming from pause: refetch events from server to get logs stored while paused
	const prevPausedRef = useRef(isPaused);
	useEffect(() => {
		if (prevPausedRef.current && !isPaused && resolvedId) {
			queryClient.invalidateQueries({ queryKey: eventKeys.all(resolvedId) });
		}
		prevPausedRef.current = isPaused;
	}, [isPaused, resolvedId, queryClient]);

	useEffect(() => {
		if (hasFilters) {
			setSearchPage(1);
			setListPage(1);
		}
	}, [searchFilter, methodFilter, statusFilter, ipFilter, requestIdFilter]);

	useEffect(() => {
		setSearchPage(1);
		setListPage(1);
	}, [pageSize]);

	// No filters: server-side pagination over full dataset (eventsData). With filters: searchData.
	const displayEvents = hasFilters
		? (searchData?.events ?? [])
		: (eventsData?.events ?? []);

	const handleSelectEvent = (event: WebhookEvent) => {
		setSelectedEvent(event);
		setSearchParams((prev) => {
			prev.set("req", String(event.id));
			return prev;
		});
	};

	useEffect(() => {
		const reqId = searchParams.get("req");
		if (!reqId) return;
		if (selectedEvent && String(selectedEvent.id) === reqId) return;
		if (displayEvents.length === 0) return;
		const match = displayEvents.find((e) => String(e.id) === reqId);
		if (match) setSelectedEvent(match);
	}, [searchParams, displayEvents, selectedEvent, setSelectedEvent]);
	const pagination =
		hasFilters && searchData?.pagination
			? {
					page: searchData.pagination.page,
					totalPages: searchData.pagination.totalPages,
					total: searchData.pagination.total,
					onPrev: () => setSearchPage((p) => Math.max(1, p - 1)),
					onNext: () =>
						setSearchPage((p) =>
							Math.min(searchData.pagination!.totalPages, p + 1),
						),
				}
			: !hasFilters && eventsData?.pagination
				? {
						page: eventsData.pagination.page,
						totalPages: eventsData.pagination.totalPages,
						total: eventsData.pagination.total,
						onPrev: () => setListPage((p) => Math.max(1, p - 1)),
						onNext: () =>
							setListPage((p) =>
								Math.min(eventsData.pagination!.totalPages, p + 1),
							),
					}
				: undefined;

	const fullWebhookUrl = toFullWebhookUrl(webhook?.url ?? "");
	const handleCopy = async () => navigator.clipboard.writeText(fullWebhookUrl);
	const handleClear = async () => {
		try {
			await clearMutation.mutateAsync();
			setSelectedEvent(null);
			resetFilters();
			setEvents([]);
			setSearchPage(1);
			setListPage(1);
		} catch {
			// ignore
		}
	};

	if (!webhookId) {
		return (
			<Box p={8} color="var(--wl-text)">
				<Text color="var(--wl-error)">Missing webhook ID</Text>
			</Box>
		);
	}

	// Full-page spinner only for initial load (webhook + events). When filters are active,
	// keep the UI visible and show loading state in the request list instead of blanking the app.
	const showFullPageSpinner =
		webhookLoading ||
		(eventsLoading && !eventsData && !hasFilters);

	if (showFullPageSpinner) {
		return (
			<Box
				minH="100vh"
				bg="var(--wl-bg)"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Spinner size="xl" color="var(--wl-accent)" />
			</Box>
		);
	}

	return (
		<Box
			position="fixed"
			inset={0}
			display="flex"
			flexDir="column"
			overflow="hidden"
			minW={0}
			bg="var(--wl-bg)"
			color="var(--wl-text)"
		>
			<InspectHeader
				webhookUrl={fullWebhookUrl}
				connected={connected && !isPaused}
				onCopy={handleCopy}
				onClear={handleClear}
			/>

			<Box flex={1} minH={0} minW={0} display="flex" overflow="hidden" position="relative" pb={{ md: 10 }}>
				<RequestListPanel
					events={displayEvents}
					onSelectEvent={handleSelectEvent}
					filterMode={hasFilters}
					pagination={pagination}
					pageSize={pageSize}
					onPageSizeChange={(size) => {
						setPageSize(size);
						setListPage(1);
						setSearchPage(1);
					}}
					isSearching={hasFilters && searchLoading}
					isRefetching={hasFilters ? searchFetching : eventsFetching}
				/>
				<InspectMainContent events={displayEvents} />
			</Box>

			<InspectFooter
				webhookId={resolvedId ?? null}
				requestCount={
					stats?.count ??
					pagination?.total ??
					(hasFilters ? 0 : displayEvents.length)
				}
				totalSizeBytes={stats?.totalSize ?? 0}
				statsLoading={statsLoading}
			/>
		</Box>
	);
}
