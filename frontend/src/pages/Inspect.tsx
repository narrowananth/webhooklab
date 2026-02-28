/**
 * Inspect page: header, left request list panel, right inspector, footer.
 * RequestListPanel has search + Method/Status/IP/Request ID filters. Inspector shows selected request.
 * When filters active: server-side search. Otherwise: live WebSocket events.
 */
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
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
} from "../hooks/useWebhookQueries";
import { useWebSocket } from "../hooks/useWebSocket";
import { useInspectStore } from "../store/useInspectStore";
import { toFullWebhookUrl } from "../utils/truncateUrl";
import type { WebhookEvent } from "../types";

export function Inspect() {
	const { webhookId } = useParams<{ webhookId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		setSelectedEvent,
		resetFilters,
		searchFilter,
		methodFilter,
		ipFilter,
		requestIdFilter,
		pageSize,
		setPageSize,
	} = useInspectStore();
	const [searchPage, setSearchPage] = useState(1);

	const { data: webhook, isLoading: webhookLoading } = useWebhookQuery(webhookId ?? undefined);
	const { data: eventsData, isLoading: eventsLoading } = useEventsQuery(
		webhookId ?? undefined,
		1,
		pageSize,
	);
	const clearMutation = useClearEventsMutation(webhookId ?? undefined);
	const { events: wsEvents, setEvents, connected } =
		useWebSocket(webhookId ?? null);
	const { data: stats, isLoading: statsLoading } = useEventStatsQuery(
		webhookId ?? undefined,
	);

	const hasFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	const searchQueryParams = {
		search: searchFilter?.trim() || undefined,
		method: methodFilter && methodFilter !== "All" ? methodFilter : undefined,
		ip: ipFilter?.trim() || undefined,
		requestId: requestIdFilter ? Number.parseInt(requestIdFilter, 10) : undefined,
		page: searchPage,
		limit: pageSize,
	};

	const { data: searchData, isLoading: searchLoading } = useSearchEventsQuery(
		webhookId ?? undefined,
		searchQueryParams,
		hasFilters,
	);

	useEffect(() => {
		if (eventsData?.events) setEvents(eventsData.events);
	}, [eventsData?.events, setEvents]);

	useEffect(() => {
		if (hasFilters) setSearchPage(1);
	}, [searchFilter, methodFilter, ipFilter, requestIdFilter]);

	useEffect(() => {
		setSearchPage(1);
	}, [pageSize]);

	const displayEvents = hasFilters ? (searchData?.events ?? []) : wsEvents;

	const handleSelectEvent = (event: WebhookEvent) => {
		setSelectedEvent(event);
		setSearchParams((prev) => {
			prev.set("req", String(event.id));
			return prev;
		});
	};

	useEffect(() => {
		const reqId = searchParams.get("req");
		if (reqId && displayEvents.length > 0) {
			const match = displayEvents.find((e) => String(e.id) === reqId);
			if (match) setSelectedEvent(match);
		}
	}, [searchParams, displayEvents, setSelectedEvent]);
	const pagination = hasFilters && searchData?.pagination
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
		: undefined;

	const fullWebhookUrl = toFullWebhookUrl(webhook?.url ?? "");
	const handleCopy = () => navigator.clipboard.writeText(fullWebhookUrl);
	const handleClear = async () => {
		try {
			await clearMutation.mutateAsync();
			setSelectedEvent(null);
			resetFilters();
			setEvents([]);
			setSearchPage(1);
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

	if (
		webhookLoading ||
		(eventsLoading && !eventsData && !hasFilters) ||
		(hasFilters && searchLoading && !searchData)
	) {
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
			bg="var(--wl-bg)"
			color="var(--wl-text)"
		>
			<InspectHeader
				webhookUrl={fullWebhookUrl}
				connected={connected}
				onCopy={handleCopy}
				onClear={handleClear}
			/>

			<Box flex={1} minH={0} display="flex" overflow="hidden" position="relative" pb={{ md: 10 }}>
				<RequestListPanel
					events={displayEvents}
					onSelectEvent={handleSelectEvent}
					filterMode={hasFilters}
					pagination={pagination}
					pageSize={pageSize}
					onPageSizeChange={setPageSize}
				/>
				<InspectMainContent events={displayEvents} />
			</Box>

			<InspectFooter
				webhookId={webhookId}
				requestCount={
					stats?.count ??
					(hasFilters ? pagination?.total ?? 0 : displayEvents.length)
				}
				totalSizeBytes={stats?.totalSize ?? 0}
				statsLoading={statsLoading}
			/>
		</Box>
	);
}
