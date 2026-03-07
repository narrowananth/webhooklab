/**
 * Inspect page: header, left request list panel, right inspector, footer.
 * RequestListPanel has search + Method/Status/IP/Request ID filters. Inspector shows selected request.
 * When filters active: server-side search. Otherwise: server-side paginated list (full dataset).
 */
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
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
import { copyToClipboard } from "../utils/clipboard";
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
		autoSelectNew,
		setSidebarOpen,
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
	const handleNewEvent = () => {
		if (resolvedId) {
			queryClient.invalidateQueries({ queryKey: eventKeys.stats(resolvedId) });
			queryClient.invalidateQueries({ queryKey: eventKeys.all(resolvedId) });
		}
	};
	const { events: wsEvents, setEvents, connected } = useWebSocket(resolvedId ?? null, handleNewEvent);
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
		// Merge REST first page into WS buffer when on page 1 (keep newest-first by id after merge)
		if (eventsData?.events && !hasFilters && listPage === 1) {
			const rest = eventsData.events;
			const restIds = new Set(rest.map((r) => r.id));
			setEvents((prev) => {
				const wsOnly = prev.filter((p) => !restIds.has(p.id));
				const merged = [...wsOnly, ...rest];
				// Dedupe by id and sort descending by id so page 1 is always newest-first
				const seen = new Set<number>();
				return merged
					.filter((e) => {
						if (seen.has(e.id)) return false;
						seen.add(e.id);
						return true;
					})
					.sort((a, b) => b.id - a.id);
			});
		}
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

	// No filters: server-side pagination. On page 1 use merged WS + REST for real-time; other pages use REST only.
	const displayEvents =
		hasFilters
			? (searchData?.events ?? [])
			: listPage === 1
				? wsEvents
				: (eventsData?.events ?? []);

	const handleSelectEvent = (event: WebhookEvent) => {
		setSelectedEvent(event);
		setSidebarOpen(false); // close mobile sidebar overlay when a request is selected
		setSearchParams((prev) => {
			prev.set("req", String(event.id));
			return prev;
		});
	};

	// When "Auto-select new requests" is ON: keep selection on the latest record (by id = newest).
	// When OFF: only the user-clicked or URL-synced record is shown.
	// Use ref + stable deps to avoid "Maximum update depth exceeded" from effect re-triggering.
	const lastAutoSelectedIdRef = useRef<number | null>(null);
	// Derive latest by max id so we're not dependent on list order (merge/refetch can reorder).
	const latestId =
		displayEvents.length > 0
			? Math.max(...displayEvents.map((e) => e.id))
			: null;
	useEffect(() => {
		if (!autoSelectNew || latestId == null) return;
		const latest = displayEvents.find((e) => e.id === latestId);
		if (!latest) return;
		if (selectedEvent?.id === latestId) {
			lastAutoSelectedIdRef.current = latestId;
			return;
		}
		if (lastAutoSelectedIdRef.current === latestId) return;
		lastAutoSelectedIdRef.current = latestId;
		setSelectedEvent(latest);
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("req", String(latestId));
			return next;
		});
	}, [autoSelectNew, latestId, selectedEvent?.id, displayEvents, setSelectedEvent, setSearchParams]);

	// Sync selection from URL (req param) only when Auto-select is OFF — when ON, latest record is the source of truth.
	useEffect(() => {
		if (autoSelectNew) return;
		const reqId = searchParams.get("req");
		if (!reqId) return;
		if (selectedEvent && String(selectedEvent.id) === reqId) return;
		if (displayEvents.length === 0) return;
		const match = displayEvents.find((e) => String(e.id) === reqId);
		if (match) setSelectedEvent(match);
	}, [autoSelectNew, searchParams, displayEvents, selectedEvent, setSelectedEvent]);
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

	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const fullWebhookUrl = toFullWebhookUrl(webhook?.url ?? "");
	const handleCopy = async () => {
		const urlToCopy = fullWebhookUrl || `${window.location.origin}/webhook/${webhookId ?? ""}`;
		await copyToClipboard(urlToCopy);
	};
	const performClear = async () => {
		try {
			await clearMutation.mutateAsync();
			setSelectedEvent(null);
			setSidebarOpen(false);
			resetFilters();
			setEvents([]);
			setSearchPage(1);
			setListPage(1);
			setShowClearConfirm(false);
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
				onClear={() => setShowClearConfirm(true)}
			/>

			{/* Clear confirmation modal - theme-aware, centered on all screen sizes */}
			{showClearConfirm && (
				<Box
					position="fixed"
					inset={0}
					zIndex={9999}
					display="flex"
					alignItems="center"
					justifyContent="center"
					bg="rgba(0,0,0,0.5)"
					backdropFilter="blur(8px)"
					onClick={(e) => e.target === e.currentTarget && setShowClearConfirm(false)}
				>
					<Box
						role="dialog"
						aria-modal="true"
						aria-labelledby="clear-dialog-title"
						bg="var(--wl-surface)"
						borderWidth="1px"
						borderColor="var(--wl-border)"
						rounded="2xl"
						maxW="400px"
						w="calc(100% - 2rem)"
						mx={4}
						p={8}
						onClick={(e) => e.stopPropagation()}
						boxShadow="0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--wl-border-subtle)"
					>
						<Flex align="center" gap={4} mb={5}>
							<Box
								w={12}
								h={12}
								rounded="xl"
								bg="var(--wl-error-muted)"
								color="var(--wl-error)"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<span className="material-symbols-outlined" style={{ fontSize: 26 }}>
									delete_sweep
								</span>
							</Box>
							<Box textAlign="left" flex={1}>
								<Text id="clear-dialog-title" fontWeight={600} fontSize="lg" color="var(--wl-text)">
									Clear all requests
								</Text>
								<Text fontSize="sm" color="var(--wl-text-muted)" mt={0.5}>
									This cannot be undone
								</Text>
							</Box>
						</Flex>
						<Text color="var(--wl-text-secondary)" fontSize="sm" lineHeight="1.6" mb={6}>
							All webhook requests will be permanently deleted and will not be available again.
						</Text>
						<Flex gap={3} justify="flex-end">
							<button
								type="button"
								className="wl-modal-btn-cancel"
								style={{
									padding: "8px 16px",
									fontSize: "14px",
									fontWeight: 500,
									borderRadius: "var(--wl-radius-lg)",
									cursor: "pointer",
								}}
								onClick={() => setShowClearConfirm(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="wl-modal-btn-danger"
								disabled={clearMutation.isPending}
								style={{
									padding: "8px 16px",
									fontSize: "14px",
									fontWeight: 500,
									borderRadius: "var(--wl-radius-lg)",
									cursor: clearMutation.isPending ? "wait" : "pointer",
								}}
								onClick={() => performClear()}
							>
								{clearMutation.isPending ? "Deleting…" : "Delete all"}
							</button>
						</Flex>
					</Box>
				</Box>
			)}

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
				wsConnected={connected && !isPaused}
			/>
		</Box>
	);
}
