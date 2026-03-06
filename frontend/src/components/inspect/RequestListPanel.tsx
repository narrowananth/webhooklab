/**
 * Left panel: search, Method/Status/IP/Request ID filters, scrollable request list.
 * When filterMode: server-side search, no client filtering. Otherwise: client-side filter.
 */
import { keyframes } from "@emotion/react";
import { Badge, Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { WebhookEvent } from "../../types";
import { METHOD_BADGE_STYLES, BADGE_STYLE_GRAY } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";
import { formatSize, getRequestSizeBytes } from "../../utils/requestSize";
import { getEventTimestamp, parseDate } from "../../utils/relativeTime";

const listOverlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const loadingBarShimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;
const dotBounce = keyframes`
  0%, 60%, 100% { transform: scale(0.75); opacity: 0.6; }
  30% { transform: scale(1.15); opacity: 1; }
`;
const iconSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/** Circle dot loader: 3 dots bouncing in sequence + sync (data/log) icon */
function CircleDotLoader({ showIcon = true }: { showIcon?: boolean }) {
	return (
		<Flex align="center" gap={2}>
			{showIcon && (
				<Box color="var(--wl-accent)" css={{ animation: `${iconSpin} 1.2s linear infinite` }}>
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
						sync
					</span>
				</Box>
			)}
			<Flex align="center" gap={1} role="status" aria-label="Loading">
				{[0, 1, 2].map((i) => (
					<Box
						key={i}
						w="6px"
						h="6px"
						rounded="full"
						bg="var(--wl-accent)"
						css={{
							animation: `${dotBounce} 0.6s ease-in-out infinite both`,
							animationDelay: `${i * 0.12}s`,
						}}
					/>
				))}
			</Flex>
		</Flex>
	);
}

const METHODS = ["All", "GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const STATUS_OPTIONS = ["All", "2xx", "4xx", "5xx"];

function getStatusLabel(status: number | undefined): string {
	const s = status ?? 200;
	if (s >= 200 && s < 300) return "OK";
	if (s >= 400 && s < 500) return "Client error";
	if (s >= 500) return "Server error";
	return "OK";
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100] as const;

interface RequestListPanelProps {
	events: WebhookEvent[];
	onSelectEvent: (event: WebhookEvent) => void;
	filterMode?: boolean;
	pagination?: {
		page: number;
		totalPages: number;
		total: number;
		onPrev: () => void;
		onNext: () => void;
	};
	pageSize?: number;
	onPageSizeChange?: (size: number) => void;
	/** When true, show loading state in list instead of blanking */
	isSearching?: boolean;
	/** When true, show subtle loading indicator while keeping list visible (e.g. page size change) */
	isRefetching?: boolean;
}

export function RequestListPanel({
	events,
	onSelectEvent,
	filterMode = false,
	pagination,
	pageSize = 25,
	onPageSizeChange,
	isSearching = false,
	isRefetching = false,
}: RequestListPanelProps) {
	const {
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
		selectedEvent,
		sidebarOpen,
		setSidebarOpen,
	} = useInspectStore();
	const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
	const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

	const filteredEvents = useMemo(() => {
		// Dedupe by id so list keys are unique (safety net for WS/REST merge or duplicate messages)
		const seen = new Set<number>();
		const deduped = events.filter((e) => {
			if (seen.has(e.id)) return false;
			seen.add(e.id);
			return true;
		});
		const filtered = filterMode
			? deduped
			: deduped.filter((e) => {
					if (searchFilter) {
						const q = searchFilter.toLowerCase();
						const bodyStr = e.rawBody ?? JSON.stringify(e.body ?? {});
						const match =
							e.method.toLowerCase().includes(q) ||
							bodyStr.toLowerCase().includes(q) ||
							JSON.stringify(e.headers ?? {}).toLowerCase().includes(q) ||
							JSON.stringify(e.queryParams ?? {}).toLowerCase().includes(q) ||
							(e.ip?.toLowerCase().includes(q) ?? false);
						if (!match) return false;
					}
					if (methodFilter && methodFilter !== "All" && e.method !== methodFilter) return false;
					if (ipFilter?.trim() && !e.ip?.toLowerCase().includes(ipFilter.trim().toLowerCase()))
						return false;
					if (
						requestIdFilter?.trim() &&
						String(e.id) !== requestIdFilter.trim()
					)
						return false;
					if (statusFilter && statusFilter !== "All") {
						const status = e.status ?? 200;
						if (statusFilter === "2xx") return status >= 200 && status < 300;
						if (statusFilter === "4xx") return status >= 400 && status < 500;
						if (statusFilter === "5xx") return status >= 500 && status < 600;
						return true;
					}
					return true;
				});
		// Always show newest first (descending by request id)
		return [...filtered].sort((a, b) => b.id - a.id);
	}, [events, filterMode, searchFilter, methodFilter, statusFilter, ipFilter, requestIdFilter]);

	const hasActiveFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		(statusFilter && statusFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	// "Filters active" label only when IP or Request ID are filled (content in the collapsible section)
	const hasAdvancedFilters = !!(ipFilter?.trim() || requestIdFilter?.trim());

	// On small screens only: hide list when a request is selected and sidebar is closed.
	// When sidebarOpen is true, show list as overlay. From md (768px) up we always show the sidebar.
	const isMobileWithSelection = !!selectedEvent;
	const isOverlay = isMobileWithSelection && sidebarOpen;

	return (
		<>
			{/* Backdrop when request list is open as overlay on mobile */}
			{isOverlay && (
				<Box
					position="fixed"
					inset={0}
					zIndex={49}
					bg="blackAlpha.600"
					display={{ base: "block", md: "none" }}
					onClick={() => setSidebarOpen(false)}
					aria-hidden
				/>
			)}
			<Box
			w={{
				base: isOverlay ? "min(320px, 85vw)" : "full",
				md: "var(--wl-sidebar-width)",
			}}
			minW={{ base: 0, md: "var(--wl-sidebar-min-width)" }}
			maxW={{ md: "var(--wl-sidebar-max-width)" }}
			position={{ base: isOverlay ? "fixed" : "relative", md: "relative" }}
			left={{ base: isOverlay ? 0 : undefined, md: undefined }}
			top={{ base: isOverlay ? 0 : undefined, md: undefined }}
			bottom={{ base: isOverlay ? 0 : undefined, md: undefined }}
			zIndex={{ base: isOverlay ? 50 : undefined, md: undefined }}
			flexShrink={0}
			minH={0}
			borderRightWidth={{ md: "1px" }}
			borderColor="var(--wl-border)"
			bg="var(--wl-surface)"
			display={{ base: (isMobileWithSelection && !sidebarOpen) ? "none" : "flex", md: "flex" }}
			flexDir="column"
			overflow="hidden"
		>
			{/* When overlay: show close button at top so user can close sidebar without tapping backdrop */}
			{isOverlay && (
				<Flex
					align="center"
					justify="flex-end"
					p={2}
					borderBottomWidth="1px"
					borderColor="var(--wl-border-subtle)"
					bg="var(--wl-bg-subtle)"
				>
					<Box
						as="button"
						display="flex"
						alignItems="center"
						justifyContent="center"
						w={9}
						h={9}
						rounded="lg"
						color="var(--wl-text-subtle)"
						_hover={{ bg: "var(--wl-bg-hover)", color: "var(--wl-text)" }}
						onClick={() => setSidebarOpen(false)}
						aria-label="Close request list"
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
							close
						</span>
					</Box>
				</Flex>
			)}
			{/* Search + Filters */}
			<Box p="var(--wl-fluid-px)" borderBottomWidth="1px" borderColor="var(--wl-border)" flexShrink={0}>
				<Flex position="relative" mb={3}>
					<Box
						position="absolute"
						left={3}
						top="50%"
						transform="translateY(-50%)"
						color="var(--wl-text-subtle)"
						pointerEvents="none"
						zIndex={1}
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)", color: "var(--wl-text-subtle)" }}>
							search
						</span>
					</Box>
					<Input
						placeholder="Search requests..."
						value={searchFilter}
						onChange={(e) => setSearchFilter(e.target.value)}
						pl={10}
						pr={4}
						py={2}
						fontSize="sm"
						bg="var(--wl-bg)"
						borderColor="var(--wl-border-subtle)"
						rounded="lg"
						_placeholder={{ color: "var(--wl-text-subtle)" }}
					/>
				</Flex>
				<Flex gap={2}>
					<Box position="relative" flex={1}>
						<Box
							as="button"
							w="full"
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							px={3}
							py={2}
							bg="var(--wl-bg)"
							rounded="lg"
							fontSize="xs"
							fontWeight="medium"
							lineHeight="1"
							color="var(--wl-text-muted)"
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							_hover={{ bg: "var(--wl-bg-hover)", borderColor: "var(--wl-border)" }}
							transition="background 0.15s, border-color 0.15s"
							onClick={() => {
								setMethodDropdownOpen(!methodDropdownOpen);
								setStatusDropdownOpen(false);
							}}
						>
							Method: {methodFilter || "All"}
							<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)", color: "var(--wl-text-subtle)" }}>
								expand_more
							</span>
						</Box>
						{methodDropdownOpen && (
							<>
								<Box
									position="fixed"
									inset={0}
									zIndex={10}
									onClick={() => setMethodDropdownOpen(false)}
								/>
								<Box
									position="absolute"
									top="100%"
									left={0}
									right={0}
									mt={1}
									zIndex={20}
									bg="var(--wl-bg-subtle)"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
									rounded="lg"
									py={1}
									shadow="lg"
								>
									{METHODS.map((m) => (
										<Box
											key={m}
											as="button"
											w="full"
											textAlign="left"
											px={3}
											py={1.5}
											fontSize="xs"
											_hover={{ bg: "var(--wl-bg-hover)" }}
											onClick={() => {
												setMethodFilter(m === "All" ? "" : m);
												setMethodDropdownOpen(false);
											}}
										>
											{m}
										</Box>
									))}
								</Box>
							</>
						)}
					</Box>
					<Box position="relative" flex={1}>
						<Box
							as="button"
							w="full"
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							px={3}
							py={2}
							bg="var(--wl-bg)"
							rounded="lg"
							fontSize="xs"
							fontWeight="medium"
							color="var(--wl-text-muted)"
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							_hover={{ bg: "var(--wl-bg-hover)", borderColor: "var(--wl-border)" }}
							transition="background 0.15s, border-color 0.15s"
							onClick={() => {
								setStatusDropdownOpen(!statusDropdownOpen);
								setMethodDropdownOpen(false);
							}}
						>
							Status: {statusFilter || "All"}
							<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)", color: "var(--wl-text-subtle)" }}>
								expand_more
							</span>
						</Box>
						{statusDropdownOpen && (
							<>
								<Box
									position="fixed"
									inset={0}
									zIndex={10}
									onClick={() => setStatusDropdownOpen(false)}
								/>
								<Box
									position="absolute"
									top="100%"
									left={0}
									right={0}
									mt={1}
									zIndex={20}
									bg="var(--wl-bg-subtle)"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
									rounded="lg"
									py={1}
									shadow="lg"
								>
									{STATUS_OPTIONS.map((s) => (
										<Box
											key={s}
											as="button"
											w="full"
											textAlign="left"
											px={3}
											py={1.5}
											fontSize="xs"
											_hover={{ bg: "var(--wl-bg-hover)" }}
											onClick={() => {
												setStatusFilter(s === "All" ? "" : s);
												setStatusDropdownOpen(false);
											}}
										>
											{s}
										</Box>
									))}
								</Box>
							</>
						)}
					</Box>
				</Flex>
				{hasActiveFilters && (
					<Button
						size="sm"
						variant="outline"
						gap={2}
						onClick={() => {
							setSearchFilter("");
							setMethodFilter("");
							setStatusFilter("");
							setIpFilter("");
							setRequestIdFilter("");
						}}
						w="full"
						mt={2}
						justifyContent="center"
						py={2}
						fontSize="xs"
						fontWeight={500}
						color="var(--wl-text-muted)"
						borderColor="var(--wl-border-subtle)"
						_hover={{
							bg: "var(--wl-bg-hover)",
							borderColor: "var(--wl-border)",
							color: "var(--wl-text)",
						}}
					>
						Clear all filters
					</Button>
				)}
				{/* IP + Request ID filters (collapsible) */}
				<Box mt={2}>
					<Box
						as="button"
						w="full"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						py={1.5}
						px={2}
						rounded="md"
						lineHeight="1"
						_hover={{ bg: "var(--wl-bg-hover)" }}
						onClick={() => setFiltersExpanded(!filtersExpanded)}
					>
						<Text fontSize="xs" fontWeight="semibold" color="var(--wl-text-subtle)" lineHeight="1">
							{hasAdvancedFilters ? "Filters active" : "More filters"}
						</Text>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: "var(--wl-icon-md)",
								color: "var(--wl-text-subtle)",
								transform: filtersExpanded ? "rotate(180deg)" : "none",
								transition: "transform 0.2s",
							}}
						>
							expand_more
						</span>
					</Box>
					{filtersExpanded && (
						<Flex gap={2} mt={2} flexDir="column">
							<Flex position="relative">
								<Box
									position="absolute"
									left={3}
									top="50%"
									transform="translateY(-50%)"
									color="var(--wl-text-subtle)"
									pointerEvents="none"
									zIndex={1}
								>
<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)", color: "var(--wl-text-subtle)" }}>
									public
									</span>
								</Box>
								<Input
									placeholder="IP address (e.g. 192.168.1.1)"
									value={ipFilter}
									onChange={(e) => setIpFilter(e.target.value)}
									size="sm"
									pl={10}
									pr={4}
									py={2}
									bg="var(--wl-bg)"
									borderColor="var(--wl-border-subtle)"
									rounded="lg"
									fontSize="xs"
									_placeholder={{ color: "var(--wl-text-subtle)" }}
								/>
							</Flex>
							<Flex position="relative">
								<Box
									position="absolute"
									left={3}
									top="50%"
									transform="translateY(-50%)"
									color="var(--wl-text-subtle)"
									pointerEvents="none"
									zIndex={1}
								>
									<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)", color: "var(--wl-text-subtle)" }}>
										tag
									</span>
								</Box>
								<Input
									placeholder="Request ID (e.g. 42)"
									value={requestIdFilter}
									onChange={(e) => setRequestIdFilter(e.target.value.replace(/\D/g, ""))}
									size="sm"
									pl={10}
									pr={4}
									py={2}
									bg="var(--wl-bg)"
									borderColor="var(--wl-border-subtle)"
									rounded="lg"
									fontSize="xs"
									_placeholder={{ color: "var(--wl-text-subtle)" }}
								/>
							</Flex>
						</Flex>
					)}
				</Box>
			</Box>

			{/* Request list - only scrollable area */}
			<Box
				flex={1}
				minH={0}
				overflowY="auto"
				px="var(--wl-fluid-sm)"
				py="var(--wl-fluid-sm)"
				position="relative"
				css={{
					scrollbarWidth: "thin",
					scrollbarColor: "var(--wl-border-subtle) var(--wl-surface)",
					"&::-webkit-scrollbar": {
						width: 8,
					},
					"&::-webkit-scrollbar-track": {
						background: "var(--wl-surface)",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "var(--wl-border-subtle)",
						borderRadius: 4,
						border: "2px solid var(--wl-surface)",
					},
					"&::-webkit-scrollbar-thumb:hover": {
						background: "var(--wl-border)",
					},
				}}
			>
				{/* Refreshing: slim top bar + small pill — list stays visible */}
				{isRefetching && (
					<Box
						position="sticky"
						top={0}
						zIndex={10}
						mb={3}
						css={{ animation: `${listOverlayFadeIn} 0.15s ease-out` }}
					>
						{/* Thin indeterminate loading bar */}
						<Box
							h="2px"
							w="full"
							bg="var(--wl-border-subtle)"
							rounded="full"
							overflow="hidden"
							mb={2}
						>
							<Box
								h="full"
								w="33%"
								bg="var(--wl-accent)"
								rounded="full"
								css={{
									animation: `${loadingBarShimmer} 1.2s ease-in-out infinite`,
								}}
							/>
						</Box>
						<Flex align="center" gap={2}>
							<CircleDotLoader showIcon={true} />
							<Text fontSize="xs" fontWeight={500} color="var(--wl-text-subtle)">
								{filteredEvents.length > 0 ? "Refreshing…" : "Loading…"}
							</Text>
						</Flex>
					</Box>
				)}
				{isSearching && filteredEvents.length === 0 ? (
					<Box p="var(--wl-fluid-xl)" display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={3}>
						<CircleDotLoader showIcon={true} />
						<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-subtle)">
							Searching...
						</Text>
					</Box>
				) : filteredEvents.length === 0 ? (
					<Box p="var(--wl-fluid-xl)" textAlign="center">
						<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-subtle)">
							No requests yet
						</Text>
					</Box>
				) : (
					filteredEvents.map((event) => {
						const isSelected = selectedEvent?.id === event.id;
						const ts = getEventTimestamp(event);
						const dateTime = ts
							? (parseDate(ts)?.toLocaleString(undefined, {
									year: "numeric",
									month: "short",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								}) ?? "—")
							: "—";
						const badgeStyle = METHOD_BADGE_STYLES[event.method] ?? BADGE_STYLE_GRAY;

						return (
							<Box
								key={event.id}
								as="button"
								w="full"
								textAlign="left"
								display="flex"
								flexDir="column"
								alignItems="stretch"
								p={4}
								mb={2}
								cursor="pointer"
								rounded="lg"
								borderWidth="1px"
								borderColor={isSelected ? "var(--wl-accent)" : "var(--wl-border)"}
								bg={isSelected ? "var(--wl-elevated)" : "var(--wl-bg)"}
								_hover={{
									bg: isSelected ? "var(--wl-elevated)" : "var(--wl-bg-muted)",
									borderColor: isSelected ? "var(--wl-accent)" : "var(--wl-border)",
								}}
								onClick={() => onSelectEvent(event)}
							>
								<Flex justify="space-between" align="center" gap={2}>
									<Flex align="center" gap={2} minW={0}>
										<Badge
											bg={badgeStyle.bg}
											color={badgeStyle.fg}
											size="sm"
											fontSize="12px"
											fontWeight={600}
											letterSpacing="0.04em"
											textTransform="uppercase"
											lineHeight="1"
										>
											{event.method === "DELETE" ? "DEL" : event.method}
										</Badge>
										<Text fontSize="13px" fontWeight={500} lineHeight="1" color="var(--wl-text)">
											{event.status ?? 200} {getStatusLabel(event.status)}
										</Text>
									</Flex>
									<Text fontSize="12px" color="var(--wl-text-subtle)" flexShrink={0}>
										{dateTime}
									</Text>
								</Flex>
								<Flex align="center" gap={3} mt={2} fontSize="12px" color="var(--wl-text-subtle)" lineHeight="1">
									<Flex align="center" gap={1}>
										<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-sm)", color: "var(--wl-text-subtle)" }}>
											public
										</span>
										{event.ip ?? "—"}
									</Flex>
									<Flex align="center" gap={1}>
										<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-sm)", color: "var(--wl-text-subtle)" }}>
											data_object
										</span>
										{formatSize(getRequestSizeBytes(event))}
									</Flex>
									<Text fontSize="12px" lineHeight="1" color="var(--wl-text-subtle)">
										#{event.id}
									</Text>
								</Flex>
							</Box>
						);
					})
				)}
			</Box>

			{/* Page size dropdown + pagination bar - single line */}
			{onPageSizeChange && (
				<Flex
					minH="var(--wl-footer-bar-height)"
					px="var(--wl-fluid-px)"
					py="var(--wl-fluid-py)"
					borderTopWidth="1px"
					borderColor="var(--wl-border-subtle)"
					align="center"
					justify={pagination ? "space-between" : "center"}
					gap={2}
					flexShrink={0}
					flexWrap="nowrap"
					bg="var(--wl-bg-subtle)"
				>
					{pagination ? (
						<>
							<Flex align="center" gap={2} flex={1} minW={0} flexWrap="nowrap">
							<Button
								variant="plain"
								size="xs"
								px={2}
								py={1}
								flexShrink={0}
								rounded="md"
								borderWidth="1px"
								borderColor="var(--wl-border-subtle)"
								bg="var(--wl-bg)"
								color="var(--wl-text-subtle)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
								disabled={pagination.page <= 1}
								onClick={pagination.onPrev}
								aria-label="Previous page"
							>
								<span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--wl-text-subtle)" }}>chevron_left</span>
							</Button>
							<Text fontSize="xs" color="var(--wl-text-subtle)" whiteSpace="nowrap" flexShrink={0}>
								Page {pagination.page} / {pagination.totalPages} ({pagination.total})
							</Text>
								<Box position="relative">
									<Box
										as="button"
										px={2}
										py={1}
										fontSize="xs"
										bg="var(--wl-bg)"
										rounded="md"
										borderWidth="1px"
										borderColor="var(--wl-border-subtle)"
										_hover={{ bg: "var(--wl-bg-hover)" }}
										transition="background 0.15s"
										onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
									>
										{pageSize}/page
									</Box>
									{pageSizeDropdownOpen && (
										<>
											<Box
												position="fixed"
												inset={0}
												zIndex={10}
												onClick={() => setPageSizeDropdownOpen(false)}
											/>
											<Box
												position="absolute"
												bottom="100%"
												left={0}
												mb={1}
												zIndex={20}
												bg="var(--wl-bg-subtle)"
												borderWidth="1px"
												borderColor="var(--wl-border-subtle)"
												rounded="lg"
												py={1}
												shadow="lg"
											>
												{PAGE_SIZE_OPTIONS.map((n) => (
													<Box
														key={n}
														as="button"
														w="full"
														textAlign="left"
														px={3}
														py={1.5}
														fontSize="xs"
														_hover={{ bg: "var(--wl-bg-hover)" }}
														onClick={() => {
															onPageSizeChange(n);
															setPageSizeDropdownOpen(false);
														}}
													>
														{n}
													</Box>
												))}
											</Box>
										</>
									)}
								</Box>
							</Flex>
							<Button
								variant="plain"
								size="xs"
								px={2}
								py={1}
								flexShrink={0}
								rounded="md"
								borderWidth="1px"
								borderColor="var(--wl-border-subtle)"
								bg="var(--wl-bg)"
								color="var(--wl-text-subtle)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
								disabled={pagination.page >= pagination.totalPages}
								onClick={pagination.onNext}
								aria-label="Next page"
							>
								<span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--wl-text-subtle)" }}>chevron_right</span>
							</Button>
						</>
					) : (
						<Box position="relative">
							<Box
								as="button"
								px={2}
								py={1}
								fontSize="xs"
								bg="var(--wl-bg)"
								rounded="md"
								borderWidth="1px"
								borderColor="var(--wl-border-subtle)"
								color="var(--wl-text-subtle)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								transition="background 0.15s"
								onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
							>
								{pageSize} per page
							</Box>
							{pageSizeDropdownOpen && (
								<>
									<Box
										position="fixed"
										inset={0}
										zIndex={10}
										onClick={() => setPageSizeDropdownOpen(false)}
									/>
									<Box
										position="absolute"
										bottom="100%"
										left={0}
										mb={1}
										zIndex={20}
										bg="var(--wl-bg-subtle)"
										borderWidth="1px"
										borderColor="var(--wl-border-subtle)"
										rounded="lg"
										py={1}
										shadow="lg"
									>
										{PAGE_SIZE_OPTIONS.map((n) => (
											<Box
												key={n}
												as="button"
												w="full"
												textAlign="left"
												px={3}
												py={1.5}
												fontSize="xs"
												_hover={{ bg: "var(--wl-bg-hover)" }}
												onClick={() => {
													onPageSizeChange(n);
													setPageSizeDropdownOpen(false);
												}}
											>
												{n}
											</Box>
										))}
									</Box>
								</>
							)}
						</Box>
					)}
				</Flex>
			)}
		</Box>
		</>
	);
}
