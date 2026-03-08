import { UUID_REGEX } from "@/api";
import { Sidebar, TopNav } from "@/components/layout";
import { Box, Button, Spinner, Stack, Text } from "@/components/ui/atoms";
import { EmptyState, InspectDetailPane, InspectFooter } from "@/components/ui/organisms";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
	eventKeys,
	useClearEventsMutation,
	useEventStatsQuery,
	useEventsQuery,
	useSearchEventsQuery,
	useWebhookQuery,
} from "@/hooks/useWebhookQueries";
import { copyToClipboard } from "@/lib/clipboard";
import { toFullWebhookUrl } from "@/lib/truncateUrl";
import { useAppStore } from "@/store/use-app-store";
import { useInspectStore } from "@/store/use-inspect-store";
import type { WebhookEvent } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const DEFAULT_NO_FILTER_PAGE_SIZE = 100;

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
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		setSelectedEvent,
		selectedEvent,
		resetFilters,
		searchFilter,
		setSearchFilter,
		methodFilter,
		setMethodFilter,
		statusFilter,
		setStatusFilter,
		ipFilter,
		setIpFilter,
		requestIdFilter,
		setRequestIdFilter,
		pageSize,
		setPageSize,
		activeDetailTab,
		setActiveDetailTab,
		isPaused,
		togglePaused,
		autoSelectNew,
		sidebarOpen,
		setSidebarOpen,
	} = useInspectStore();
	const theme = useAppStore((s) => s.theme);
	const toggleTheme = useAppStore((s) => s.toggleTheme);
	const toggleAutoSelectNew = useInspectStore((s) => s.toggleAutoSelectNew);
	const queryClient = useQueryClient();
	const [searchPage, setSearchPage] = useState(1);
	const [listPage, setListPage] = useState(1);
	const [showClearConfirm, setShowClearConfirm] = useState(false);

	const hasFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		(statusFilter && statusFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	const effectivePageSize = hasFilters ? pageSize : DEFAULT_NO_FILTER_PAGE_SIZE;

	const { data: webhook, isLoading: webhookLoading, isError: webhookError } = useWebhookQuery(webhookId ?? undefined);
	const resolvedId = useResolvedWebhookId(webhookId ?? undefined, webhook);
	const { data: eventsData, isFetching: eventsFetching } = useEventsQuery(
		resolvedId,
		hasFilters ? 1 : listPage,
		effectivePageSize,
	);
	const clearMutation = useClearEventsMutation(resolvedId);
	// WS-primary sync: do not invalidate events/stats on every event:new; list is updated via useWebSocket setEvents
	const handleNewEvent = () => {};
	const {
		events: wsEvents,
		setEvents,
		connected: wsConnected,
		liveStats,
		setLiveStats,
	} = useWebSocket(resolvedId ?? null, handleNewEvent);
	const statsFromApi = hasFilters || isPaused || !wsConnected;
	const { data: stats, isLoading: statsLoading } = useEventStatsQuery(resolvedId, statsFromApi);

	const searchQueryParams = useMemo(
		() => ({
			search: searchFilter?.trim() || undefined,
			method: methodFilter && methodFilter !== "All" ? methodFilter : undefined,
			status: statusFilter && statusFilter !== "All" ? statusFilter : undefined,
			ip: ipFilter?.trim() || undefined,
			requestId: requestIdFilter ? Number.parseInt(requestIdFilter, 10) : undefined,
			page: searchPage,
			limit: pageSize,
		}),
		[searchFilter, methodFilter, statusFilter, ipFilter, requestIdFilter, searchPage, pageSize],
	);

	const {
		data: searchData,
		isLoading: searchLoading,
		isFetching: searchFetching,
	} = useSearchEventsQuery(resolvedId, searchQueryParams, hasFilters);

	useEffect(() => {
		if (eventsData?.events && !hasFilters && listPage === 1) {
			const rest = eventsData.events;
			const restIds = new Set(rest.map((r) => r.id));
			setEvents((prev) => {
				const wsOnly = prev.filter((p) => !restIds.has(p.id));
				const merged = [...wsOnly, ...rest];
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

	const prevPausedRef = useRef(isPaused);
	useEffect(() => {
		if (prevPausedRef.current && !isPaused && resolvedId) {
			// Single refetch of current page when unpausing; do not refetch stats when no filters (real-time from WS)
			if (hasFilters) {
				queryClient.invalidateQueries({
					queryKey: eventKeys.search(resolvedId, searchQueryParams),
				});
				queryClient.invalidateQueries({ queryKey: eventKeys.stats(resolvedId) });
			} else {
				queryClient.invalidateQueries({
					queryKey: [...eventKeys.all(resolvedId), listPage, effectivePageSize],
				});
				// Do not invalidate stats when !hasFilters — real-time sync resumes from next WS message
			}
		}
		prevPausedRef.current = isPaused;
	}, [
		isPaused,
		resolvedId,
		queryClient,
		hasFilters,
		listPage,
		effectivePageSize,
		searchQueryParams,
	]);

	const displayEvents = hasFilters
		? (searchData?.events ?? [])
		: listPage === 1
			? wsEvents
			: (eventsData?.events ?? []);

	const handleSelectEvent = (event: WebhookEvent) => {
		setSelectedEvent(event);
		setSidebarOpen(false);
		setSearchParams((prev) => {
			prev.set("req", String(event.id));
			return prev;
		});
	};

	const latestId = displayEvents.length > 0 ? Math.max(...displayEvents.map((e) => e.id)) : null;
	const lastAutoSelectedIdRef = useRef<number | null>(null);
	useEffect(() => {
		if (!autoSelectNew || latestId == null) return;
		const latest = displayEvents.find((e) => e.id === latestId);
		if (!latest) return;
		if (selectedEvent?.id === latestId) {
			lastAutoSelectedIdRef.current = latestId;
			if (searchParams.get("req") !== String(latestId)) {
				setSearchParams((prev) => {
					const next = new URLSearchParams(prev);
					next.set("req", String(latestId));
					return next;
				});
			}
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
	}, [
		autoSelectNew,
		latestId,
		selectedEvent?.id,
		displayEvents,
		searchParams,
		setSelectedEvent,
		setSearchParams,
	]);

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
							Math.min(searchData.pagination?.totalPages ?? 1, p + 1),
						),
				}
			: !hasFilters && (isPaused || !wsConnected) && eventsData?.pagination
				? {
						page: eventsData.pagination.page,
						totalPages: eventsData.pagination.totalPages,
						total: eventsData.pagination.total,
						onPrev: () => setListPage((p) => Math.max(1, p - 1)),
						onNext: () =>
							setListPage((p) =>
								Math.min(eventsData.pagination?.totalPages ?? 1, p + 1),
							),
					}
				: undefined;

	const useLiveStats = !hasFilters && wsConnected && !isPaused;
	const footerRequestCount = useLiveStats
		? (liveStats?.count ?? pagination?.total ?? displayEvents.length)
		: hasFilters
			? (searchData?.pagination?.total ?? stats?.count ?? 0)
			: (stats?.count ?? pagination?.total ?? displayEvents.length);
	const footerTotalSizeBytes = useLiveStats
		? (liveStats?.totalSize ?? 0)
		: (stats?.totalSize ?? 0);
	const footerStatsLoading = useLiveStats ? false : statsLoading;

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
			setEvents(() => []);
			setLiveStats({ count: 0, totalSize: 0 });
			setSearchPage(1);
			setListPage(1);
			setShowClearConfirm(false);
		} catch {
			//
		}
	};

	const hasActiveFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		(statusFilter && statusFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	if (!webhookId) {
		return (
			<Box p={8} color="var(--wl-text)">
				<Text color="var(--wl-error)">Missing webhook ID</Text>
			</Box>
		);
	}

	const showFullPageSpinner = webhookLoading;

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

	const webhookNotFound = !!webhookId && !webhookLoading && (webhookError || !webhook);
	if (webhookNotFound) {
		return (
			<Box
				minH="100vh"
				bg="var(--wl-bg)"
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				p={8}
				gap={4}
				color="var(--wl-text)"
			>
				<Text fontWeight={600} fontSize="lg" color="var(--wl-text)">
					Webhook not found
				</Text>
				<Text color="var(--wl-text-muted)" fontSize="sm" textAlign="center" maxW="min(400px, 85vw)">
					This webhook doesn't exist or the URL is incorrect. Create a new webhook or check the URL.
				</Text>
				<Button variant="primary" onClick={() => navigate("/", { replace: true })}>
					Create new webhook
				</Button>
			</Box>
		);
	}

	return (
		<Box
			position="fixed"
			inset={0}
			display="flex"
			flexDirection="row"
			overflow="hidden"
			minW={0}
			bg="var(--wl-bg)"
			color="var(--wl-text)"
		>
			{showClearConfirm && (
				<Box
					position="fixed"
					inset={0}
					zIndex={9999}
					display="flex"
					alignItems="center"
					justifyContent="center"
					bg="rgba(0,0,0,0.5)"
					onClick={(e) => e.target === e.currentTarget && setShowClearConfirm(false)}
				>
					{/* biome-ignore lint/a11y/useSemanticElements: Chakra Box used for styling; dialog semantics via role/aria */}
					<Box
						role="dialog"
						aria-modal="true"
						aria-labelledby="clear-dialog-title"
						bg="var(--wl-surface)"
						borderWidth="1px"
						borderColor="var(--wl-border)"
						borderRadius="2xl"
						maxW="400px"
						w="calc(100% - 2rem)"
						mx={4}
						p={8}
						onClick={(e) => e.stopPropagation()}
						boxShadow="0 25px 50px -12px rgba(0,0,0,0.25)"
					>
						<Stack direction="row" alignItems="center" gap={4} mb={5}>
							<Box
								w={12}
								h={12}
								borderRadius="xl"
								bg="var(--wl-error-muted)"
								color="var(--wl-error)"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 26 }}
								>
									delete_sweep
								</span>
							</Box>
							<Box flex={1}>
								<Text
									id="clear-dialog-title"
									fontWeight={600}
									fontSize="lg"
									color="var(--wl-text)"
								>
									Clear all requests
								</Text>
								<Text fontSize="sm" color="var(--wl-text-muted)" mt={0.5}>
									This cannot be undone
								</Text>
							</Box>
						</Stack>
						<Text
							color="var(--wl-text-secondary)"
							fontSize="sm"
							lineHeight="1.6"
							mb={6}
						>
							All webhook requests will be permanently deleted.
						</Text>
						<Stack direction="row" gap={3} justifyContent="flex-end">
							<Button
								variant="secondary"
								size="md"
								px={4}
								py={2}
								fontSize="14px"
								fontWeight={500}
								borderRadius="var(--wl-radius-lg)"
								bg="transparent"
								borderWidth="1px"
								borderColor="var(--wl-border)"
								color="var(--wl-text-secondary)"
								_hover={{
									bg: "var(--wl-bg-hover)",
									borderColor: "var(--wl-border)",
									color: "var(--wl-text)",
								}}
								_focusVisible={{
									outline: "2px solid var(--wl-accent)",
									outlineOffset: "2px",
								}}
								onClick={() => setShowClearConfirm(false)}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								size="md"
								disabled={clearMutation.isPending}
								px={4}
								py={2}
								fontSize="14px"
								fontWeight={500}
								borderRadius="var(--wl-radius-lg)"
								bg="var(--wl-error)"
								borderColor="var(--wl-error)"
								color="white"
								_hover={{
									opacity: 1,
									filter: "brightness(1.12)",
								}}
								_active={{
									filter: "brightness(0.95)",
								}}
								_focusVisible={{
									outline: "2px solid var(--wl-error)",
									outlineOffset: "2px",
								}}
								_disabled={{
									opacity: 0.8,
									cursor: "wait",
								}}
								onClick={() => performClear()}
							>
								{clearMutation.isPending ? "Deleting…" : "Delete all"}
							</Button>
						</Stack>
					</Box>
				</Box>
			)}

			<Box
				flex={1}
				minH={0}
				minW={0}
				display="flex"
				overflow="hidden"
				position="relative"
			>
				<Sidebar
					events={displayEvents}
					selectedEvent={selectedEvent}
					onSelectEvent={handleSelectEvent}
					searchFilter={searchFilter}
					onSearchFilterChange={setSearchFilter}
					methodFilter={methodFilter}
					onMethodFilterChange={setMethodFilter}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					ipFilter={ipFilter}
					onIpFilterChange={setIpFilter}
					requestIdFilter={requestIdFilter}
					onRequestIdFilterChange={setRequestIdFilter}
					onClearFilters={() => {
						setSearchFilter("");
						setMethodFilter("");
						setStatusFilter("All");
						setIpFilter("");
						setRequestIdFilter("");
					}}
					hasActiveFilters={hasActiveFilters}
					filterMode={hasFilters}
					pagination={pagination}
					pageSize={effectivePageSize}
					pageSizeEditable={hasFilters}
					onPageSizeChange={
						hasFilters
							? (size) => {
									setPageSize(size);
									setListPage(1);
									setSearchPage(1);
								}
							: undefined
					}
					newestEventId={latestId}
					isSearching={hasFilters && searchLoading}
					isRefetching={hasFilters ? searchFetching : eventsFetching}
					sidebarOpen={sidebarOpen}
					onCloseSidebar={() => setSidebarOpen(false)}
				/>
				<Box
					flex={1}
					minH={0}
					minW={0}
					display="flex"
					flexDirection="column"
					overflow="hidden"
					bg="var(--wl-bg)"
				>
					<TopNav
						webhookUrl={fullWebhookUrl}
						onCopy={handleCopy}
						onClear={() => setShowClearConfirm(true)}
						isPaused={isPaused}
						onTogglePause={togglePaused}
						theme={theme}
						onToggleTheme={toggleTheme}
						autoSelectNew={autoSelectNew}
						onToggleAutoSelectNew={toggleAutoSelectNew}
						sidebarOpen={sidebarOpen}
						onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
						hasSelection={!!selectedEvent}
					/>
					<Box
						flex={1}
						minH={0}
						minW={0}
						display="flex"
						flexDirection="column"
						overflow="hidden"
					>
						{selectedEvent ? (
							<InspectDetailPane
							event={selectedEvent}
							activeDetailTab={activeDetailTab}
							onTabChange={setActiveDetailTab}
							searchFilter={searchFilter}
						/>
						) : (
							<EmptyState
								title={
									displayEvents.length > 0
										? "Select a request to inspect"
										: "Waiting for webhook events..."
								}
								description={
									displayEvents.length > 0
										? "Detailed payload, headers, and response data will appear here."
										: "Send a HTTP request to your unique URL to see the request details here in real-time. We support POST, GET, PUT, and more."
								}
							/>
						)}
					</Box>
					<InspectFooter
						webhookId={resolvedId ?? null}
						requestCount={footerRequestCount}
						totalSizeBytes={footerTotalSizeBytes}
						statsLoading={footerStatsLoading}
						appVersion="1.0.0"
					/>
				</Box>
			</Box>
		</Box>
	);
}
