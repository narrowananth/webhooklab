/**
 * Left panel: search, Method/Status/IP/Request ID filters, scrollable request list.
 * When filterMode: server-side search, no client filtering. Otherwise: client-side filter.
 */
import { Badge, Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { WebhookEvent } from "../../types";
import { METHOD_BADGE_STYLES, BADGE_STYLE_GRAY } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";
import { formatSize, getRequestSizeBytes } from "../../utils/requestSize";

const METHODS = ["All", "GET", "POST", "PUT", "DELETE", "PATCH"];
const STATUS_OPTIONS = ["All", "2xx", "4xx", "5xx"];

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
}

export function RequestListPanel({
	events,
	onSelectEvent,
	filterMode = false,
	pagination,
	pageSize = 25,
	onPageSizeChange,
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
	} = useInspectStore();
	const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
	const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

	const filteredEvents = useMemo(() => {
		if (filterMode) return events;
		return events.filter((e) => {
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
				if (statusFilter === "2xx") return true;
				if (statusFilter === "4xx" || statusFilter === "5xx") return false;
			}
			return true;
		});
	}, [events, filterMode, searchFilter, methodFilter, statusFilter, ipFilter, requestIdFilter]);

	const hasActiveFilters = !!(
		searchFilter?.trim() ||
		(methodFilter && methodFilter !== "All") ||
		ipFilter?.trim() ||
		requestIdFilter?.trim()
	);

	// On mobile/tablet: hide list when a request is selected (detail takes full width)
	const isMobileWithSelection = !!selectedEvent;

	return (
		<Box
			w={{ base: "full", lg: 384 }}
			minW={{ lg: 384 }}
			flexShrink={0}
			minH={0}
			borderRightWidth={{ lg: "1px" }}
			borderColor="var(--wl-border-subtle)"
			bg="var(--wl-bg-subtle)"
			display={{ base: isMobileWithSelection ? "none" : "flex", lg: "flex" }}
			flexDir="column"
			overflow="hidden"
		>
			{/* Search + Filters */}
			<Box p={4} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)" flexShrink={0}>
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
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
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
							py={1.5}
							bg="var(--wl-bg)"
							rounded="lg"
							fontSize="xs"
							fontWeight="medium"
							color="var(--wl-text-muted)"
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							onClick={() => {
								setMethodDropdownOpen(!methodDropdownOpen);
								setStatusDropdownOpen(false);
							}}
						>
							Method: {methodFilter || "All"}
							<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)" }}>
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
											_hover={{ bg: "var(--wl-bg-muted)" }}
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
							py={1.5}
							bg="var(--wl-bg)"
							rounded="lg"
							fontSize="xs"
							fontWeight="medium"
							color="var(--wl-text-muted)"
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							onClick={() => {
								setStatusDropdownOpen(!statusDropdownOpen);
								setMethodDropdownOpen(false);
							}}
						>
							Status: {statusFilter || "All"}
							<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)" }}>
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
											_hover={{ bg: "var(--wl-bg-muted)" }}
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
						_hover={{ bg: "var(--wl-bg-muted)" }}
						onClick={() => setFiltersExpanded(!filtersExpanded)}
					>
						<Text fontSize="xs" fontWeight="semibold" color="var(--wl-text-subtle)">
							{hasActiveFilters ? "Filters active" : "More filters"}
						</Text>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: "var(--wl-icon-md)",
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
<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)" }}>
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
									<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)" }}>
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
							{hasActiveFilters && (
								<Button
									size="xs"
									variant="ghost"
									color="var(--wl-error)"
									onClick={() => {
										setSearchFilter("");
										setMethodFilter("");
										setIpFilter("");
										setRequestIdFilter("");
									}}
								>
									Clear all filters
								</Button>
							)}
						</Flex>
					)}
				</Box>
			</Box>

			{/* Request list - only scrollable area */}
			<Box flex={1} minH={0} overflowY="auto" px={2} py={2} css={{ "&::-webkit-scrollbar": { width: 6 } }}>
				{filteredEvents.length === 0 ? (
					<Box p={8} textAlign="center">
						<Text fontSize="sm" color="var(--wl-text-subtle)">
							No requests yet
						</Text>
					</Box>
				) : (
					filteredEvents.map((event) => {
						const isSelected = selectedEvent?.id === event.id;
						const dateTime = new Date(event.timestamp).toLocaleString(undefined, {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						});
						const badgeStyle = METHOD_BADGE_STYLES[event.method] ?? BADGE_STYLE_GRAY;

						return (
							<Box
								key={event.id}
								as="button"
								w="full"
								textAlign="left"
								p={4}
								mb={2}
								cursor="pointer"
								rounded="lg"
								borderWidth="1px"
								borderColor={isSelected ? "var(--wl-accent)" : "var(--wl-border-subtle)"}
								bg={isSelected ? "var(--wl-selected-bg)" : "var(--wl-bg)"}
								_hover={{
									bg: isSelected ? "var(--wl-selected-bg)" : "var(--wl-bg-muted)",
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
											fontSize="var(--wl-font-xs)"
											fontWeight="bold"
										>
											{event.method === "DELETE" ? "DEL" : event.method}
										</Badge>
										<Text fontSize="xs" fontWeight="medium" color="var(--wl-text)">
											200 OK
										</Text>
									</Flex>
									<Text fontSize="xs" color="var(--wl-text-subtle)" flexShrink={0}>
										{dateTime}
									</Text>
								</Flex>
								<Flex align="center" gap={3} mt={2} fontSize="xs" color="var(--wl-text-subtle)">
									<Flex align="center" gap={1}>
										<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-sm)" }}>
											public
										</span>
										{event.ip ?? "—"}
									</Flex>
									<Flex align="center" gap={1}>
										<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-sm)" }}>
											data_object
										</span>
										{formatSize(getRequestSizeBytes(event))}
									</Flex>
									<Text fontSize="xs" color="var(--wl-text-subtle)">
										#{event.id}
									</Text>
								</Flex>
							</Box>
						);
					})
				)}
			</Box>

			{/* Page size dropdown + pagination bar - always visible */}
			{onPageSizeChange && (
				<Flex
					px={4}
					py={3}
					borderTopWidth="1px"
					borderColor="var(--wl-border-subtle)"
					align="center"
					justify={filterMode && pagination ? "space-between" : "center"}
					gap={2}
					flexShrink={0}
					flexWrap="wrap"
					bg="var(--wl-bg-subtle)"
				>
					{filterMode && pagination ? (
						<>
							<Button
								size="sm"
								variant="outline"
								disabled={pagination.page <= 1}
								onClick={pagination.onPrev}
							>
								Prev
							</Button>
							<Flex align="center" gap={2}>
								<Text fontSize="xs" color="var(--wl-text-subtle)">
									Page {pagination.page} / {pagination.totalPages} ({pagination.total} total)
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
														_hover={{ bg: "var(--wl-bg-muted)" }}
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
								size="sm"
								variant="outline"
								disabled={pagination.page >= pagination.totalPages}
								onClick={pagination.onNext}
							>
								Next
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
												_hover={{ bg: "var(--wl-bg-muted)" }}
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
	);
}
