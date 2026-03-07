import { Box, Button, IconButton, Input, Stack, Text } from "@/components/ui/atoms";
import { SearchField } from "@/components/ui/molecules";
import { RequestItem } from "@/components/ui/organisms";
import type { WebhookEvent } from "@/types";
import { useMemo, useState } from "react";

const METHODS = ["All", "GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const STATUS_OPTIONS = ["All", "2xx", "4xx", "5xx"];
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100] as const;

export type SidebarProps = {
	events: WebhookEvent[];
	selectedEvent: WebhookEvent | null;
	onSelectEvent: (event: WebhookEvent) => void;
	searchFilter: string;
	onSearchFilterChange: (v: string) => void;
	methodFilter: string;
	onMethodFilterChange: (v: string) => void;
	statusFilter: string;
	onStatusFilterChange: (v: string) => void;
	ipFilter?: string;
	onIpFilterChange?: (v: string) => void;
	requestIdFilter?: string;
	onRequestIdFilterChange?: (v: string) => void;
	onClearFilters?: () => void;
	hasActiveFilters?: boolean;
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
	newestEventId?: number | null;
	isSearching?: boolean;
	isRefetching?: boolean;
	sidebarOpen?: boolean;
	onCloseSidebar?: () => void;
};

function CircleDotLoader({ showIcon = true }: { showIcon?: boolean }) {
	return (
		<Box display="flex" alignItems="center" gap={2}>
			{showIcon && (
				<Box color="var(--wl-accent)" className="sidebar-icon-spin">
					<Box as="span" className="material-symbols-outlined" style={{ fontSize: 16 }}>
						sync
					</Box>
				</Box>
			)}
			<Box
				display="flex"
				alignItems="center"
				gap={1}
				// biome-ignore lint/a11y/useSemanticElements: status is used for live loading announcement
				role="status"
				aria-label="Loading"
			>
				{[0, 1, 2].map((i) => (
					<Box
						key={i}
						w="6px"
						h="6px"
						rounded="full"
						bg="var(--wl-accent)"
						className="sidebar-dot"
					/>
				))}
			</Box>
		</Box>
	);
}

export function Sidebar({
	events,
	selectedEvent,
	onSelectEvent,
	searchFilter,
	onSearchFilterChange,
	methodFilter,
	onMethodFilterChange,
	statusFilter,
	onStatusFilterChange,
	ipFilter = "",
	onIpFilterChange,
	requestIdFilter = "",
	onRequestIdFilterChange,
	onClearFilters,
	hasActiveFilters = false,
	filterMode = false,
	pagination,
	pageSize = 25,
	onPageSizeChange,
	newestEventId = null,
	isSearching = false,
	isRefetching = false,
	sidebarOpen = false,
	onCloseSidebar,
}: SidebarProps) {
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);
	const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
	const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

	const filteredEvents = useMemo(() => {
		const deduped = events.filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
		if (filterMode) return [...deduped].sort((a, b) => b.id - a.id);
		return deduped
			.filter((e) => {
				if (searchFilter) {
					const q = searchFilter.toLowerCase();
					const bodyStr = e.rawBody ?? JSON.stringify(e.body ?? {});
					const match =
						e.method.toLowerCase().includes(q) ||
						bodyStr.toLowerCase().includes(q) ||
						JSON.stringify(e.headers ?? {})
							.toLowerCase()
							.includes(q) ||
						JSON.stringify(e.queryParams ?? {})
							.toLowerCase()
							.includes(q) ||
						(e.ip?.toLowerCase().includes(q) ?? false);
					if (!match) return false;
				}
				if (methodFilter && methodFilter !== "All" && e.method !== methodFilter)
					return false;
				if (statusFilter && statusFilter !== "All") {
					const status = e.status ?? 200;
					if (statusFilter === "2xx") return status >= 200 && status < 300;
					if (statusFilter === "4xx") return status >= 400 && status < 500;
					if (statusFilter === "5xx") return status >= 500 && status < 600;
				}
				if (
					ipFilter?.trim() &&
					!e.ip?.toLowerCase().includes(ipFilter.trim().toLowerCase())
				)
					return false;
				if (requestIdFilter?.trim() && String(e.id) !== requestIdFilter.trim())
					return false;
				return true;
			})
			.sort((a, b) => b.id - a.id);
	}, [events, filterMode, searchFilter, methodFilter, statusFilter, ipFilter, requestIdFilter]);

	const isMobileWithSelection = !!selectedEvent;
	const isOverlay = isMobileWithSelection && sidebarOpen;

	return (
		<>
			{isOverlay && (
				<Box
					position="fixed"
					inset={0}
					zIndex={49}
					bg="rgba(0,0,0,0.6)"
					display={{ base: "block", md: "none" }}
					onClick={onCloseSidebar}
					aria-hidden
				/>
			)}
			<Box
				as="aside"
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
				display={{
					base: isMobileWithSelection && !sidebarOpen ? "none" : "flex",
					md: "flex",
				}}
				flexDir="column"
				overflow="hidden"
			>
				{isOverlay && onCloseSidebar && (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="flex-end"
						p={2}
						borderBottomWidth="1px"
						borderColor="var(--wl-border-subtle)"
						bg="var(--wl-bg-subtle)"
					>
						<IconButton
							aria-label="Close request list"
							variant="ghost"
							size="md"
							onClick={onCloseSidebar}
							w={9}
							h={9}
							rounded="lg"
							color="var(--wl-text-subtle)"
							className="header-action-btn"
						>
							<Box
								as="span"
								className="material-symbols-outlined"
								style={{ fontSize: "var(--wl-icon-xl)" }}
							>
								close
							</Box>
						</IconButton>
					</Box>
				)}

				<Box
					p="var(--wl-fluid-px)"
					borderBottomWidth="1px"
					borderColor="var(--wl-border)"
					flexShrink={0}
				>
					<Box position="relative" mb={3}>
						<SearchField
							placeholder="Search requests..."
							value={searchFilter}
							onChange={(e) => onSearchFilterChange(e.target.value)}
							leadingIcon={
								<Box as="span" className="material-symbols-outlined text-xl">
									search
								</Box>
							}
						/>
					</Box>
					<Stack direction="row" gap={2}>
						<Box position="relative" flex={1}>
							<Button
								variant="ghost"
								size="sm"
								w="full"
								justifyContent="space-between"
								px={3}
								py={2}
								rounded="lg"
								fontSize="xs"
								fontWeight={500}
								bg="var(--wl-bg)"
								borderWidth="1px"
								borderColor="var(--wl-border-subtle)"
								color="var(--wl-text-muted)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								onClick={() => {
									setMethodDropdownOpen(!methodDropdownOpen);
									setStatusDropdownOpen(false);
								}}
								className="flex items-center"
							>
								<Text as="span">Method: {methodFilter || "All"}</Text>
								<Box
									as="span"
									className="material-symbols-outlined"
									style={{
										fontSize: "var(--wl-icon-md)",
										color: "var(--wl-text-subtle)",
									}}
								>
									expand_more
								</Box>
							</Button>
							{methodDropdownOpen && (
								<>
									<Box
										position="fixed"
										inset={0}
										zIndex={10}
										onClick={() => setMethodDropdownOpen(false)}
										aria-hidden
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
										className="shadow-lg"
									>
										{METHODS.map((m) => (
											<Button
												key={m}
												variant="ghost"
												size="sm"
												w="full"
												justifyContent="flex-start"
												px={3}
												py={1.5}
												fontSize="xs"
												color="var(--wl-text)"
												_hover={{ bg: "var(--wl-bg-hover)" }}
												onClick={() => {
													onMethodFilterChange(m === "All" ? "" : m);
													setMethodDropdownOpen(false);
												}}
											>
												{m}
											</Button>
										))}
									</Box>
								</>
							)}
						</Box>
						<Box position="relative" flex={1}>
							<Button
								variant="ghost"
								size="sm"
								w="full"
								justifyContent="space-between"
								px={3}
								py={2}
								rounded="lg"
								fontSize="xs"
								fontWeight={500}
								bg="var(--wl-bg)"
								borderWidth="1px"
								borderColor="var(--wl-border-subtle)"
								color="var(--wl-text-muted)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								onClick={() => {
									setStatusDropdownOpen(!statusDropdownOpen);
									setMethodDropdownOpen(false);
								}}
								className="flex items-center"
							>
								<Text as="span">Status: {statusFilter || "All"}</Text>
								<Box
									as="span"
									className="material-symbols-outlined"
									style={{
										fontSize: "var(--wl-icon-md)",
										color: "var(--wl-text-subtle)",
									}}
								>
									expand_more
								</Box>
							</Button>
							{statusDropdownOpen && (
								<>
									<Box
										position="fixed"
										inset={0}
										zIndex={10}
										onClick={() => setStatusDropdownOpen(false)}
										aria-hidden
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
										className="shadow-lg"
									>
										{STATUS_OPTIONS.map((s) => (
											<Button
												key={s}
												variant="ghost"
												size="sm"
												w="full"
												justifyContent="flex-start"
												px={3}
												py={1.5}
												fontSize="xs"
												color="var(--wl-text)"
												_hover={{ bg: "var(--wl-bg-hover)" }}
												onClick={() => {
													onStatusFilterChange(s === "All" ? "" : s);
													setStatusDropdownOpen(false);
												}}
											>
												{s}
											</Button>
										))}
									</Box>
								</>
							)}
						</Box>
					</Stack>
					{hasActiveFilters && onClearFilters && (
						<Button
							variant="ghost"
							size="sm"
							w="full"
							mt={2}
							py={2}
							fontSize="xs"
							fontWeight={500}
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							color="var(--wl-text-muted)"
							_hover={{ bg: "var(--wl-bg-hover)" }}
							onClick={onClearFilters}
						>
							Clear all filters
						</Button>
					)}
					{onIpFilterChange != null && onRequestIdFilterChange != null && (
						<Box mt={2}>
							<Button
								variant="ghost"
								size="sm"
								w="full"
								justifyContent="space-between"
								py={1.5}
								px={2}
								rounded="md"
								fontSize="xs"
								fontWeight={600}
								color="var(--wl-text-subtle)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								onClick={() => setFiltersExpanded(!filtersExpanded)}
								className="flex items-center"
							>
								<Text as="span">
									{hasActiveFilters ? "Filters active" : "More filters"}
								</Text>
								<Box
									as="span"
									className="material-symbols-outlined text-base transition-transform"
									style={{
										transform: filtersExpanded ? "rotate(180deg)" : undefined,
									}}
								>
									expand_more
								</Box>
							</Button>
							{filtersExpanded && (
								<Stack direction="column" gap={2} mt={2}>
									<Box position="relative">
										<Box
											as="span"
											className="material-symbols-outlined"
											position="absolute"
											left={3}
											top="50%"
											zIndex={10}
											pointerEvents="none"
											fontSize="lg"
											color="var(--wl-text-subtle)"
											transform="translateY(-50%)"
										>
											public
										</Box>
										<Input
											type="text"
											placeholder="IP address (e.g. 192.168.1.1)"
											value={ipFilter}
											onChange={(e) => onIpFilterChange(e.target.value)}
											pl={10}
											pr={4}
											py={2}
											fontSize="xs"
											rounded="lg"
											bg="var(--wl-bg)"
											borderColor="var(--wl-border-subtle)"
											color="var(--wl-text)"
										/>
									</Box>
									<Box position="relative">
										<Box
											as="span"
											className="material-symbols-outlined"
											position="absolute"
											left={3}
											top="50%"
											zIndex={10}
											pointerEvents="none"
											fontSize="lg"
											color="var(--wl-text-subtle)"
											transform="translateY(-50%)"
										>
											tag
										</Box>
										<Input
											type="text"
											placeholder="Request ID (e.g. 42)"
											value={requestIdFilter}
											onChange={(e) =>
												onRequestIdFilterChange(
													e.target.value.replace(/\D/g, ""),
												)
											}
											pl={10}
											pr={4}
											py={2}
											fontSize="xs"
											rounded="lg"
											bg="var(--wl-bg)"
											borderColor="var(--wl-border-subtle)"
											color="var(--wl-text)"
										/>
									</Box>
								</Stack>
							)}
						</Box>
					)}
				</Box>

				<Box
					flex={1}
					minH={0}
					overflowY="auto"
					overflowX="hidden"
					position="relative"
					className="custom-scrollbar p-2"
				>
					{isRefetching && filteredEvents.length > 0 && (
						<Box
							position="sticky"
							top={0}
							zIndex={10}
							mb={3}
							className="sidebar-refresh-enter"
						>
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
									className="sidebar-loading-bar"
								/>
							</Box>
							<Box display="flex" alignItems="center" gap={2}>
								<CircleDotLoader showIcon />
								<Text fontSize="xs" fontWeight={500} color="var(--wl-text-subtle)">
									Refreshing…
								</Text>
							</Box>
						</Box>
					)}
					{(isRefetching || isSearching) && filteredEvents.length === 0 ? (
						<Box
							p="var(--wl-fluid-xl)"
							display="flex"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							gap={3}
						>
							<CircleDotLoader showIcon />
							<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-subtle)">
								Loading…
							</Text>
						</Box>
					) : filteredEvents.length === 0 ? (
						<Box p="var(--wl-fluid-xl)" textAlign="center">
							<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-subtle)">
								No requests yet
							</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" gap={2.5}>
							{filteredEvents.map((event) => (
								<RequestItem
									key={event.id}
									event={event}
									isSelected={selectedEvent?.id === event.id}
									onSelect={() => onSelectEvent(event)}
									isNew={newestEventId === event.id}
								/>
							))}
						</Box>
					)}
				</Box>

				{onPageSizeChange != null && (
					<Box
						minH="var(--wl-footer-bar-height)"
						px="var(--wl-fluid-px)"
						py={2}
						borderTopWidth="1px"
						borderColor="var(--wl-border-subtle)"
						display="flex"
						alignItems="center"
						justifyContent={pagination ? "flex-start" : "center"}
						gap={2}
						flexShrink={0}
						flexWrap="nowrap"
						bg="var(--wl-bg-subtle)"
					>
						{pagination ? (
							<>
								<Stack
									direction="row"
									alignItems="center"
									gap={2}
									minW={0}
									flexWrap="nowrap"
								>
									<IconButton
										aria-label="Previous page"
										variant="ghost"
										size="sm"
										onClick={pagination.onPrev}
										disabled={pagination.page <= 1}
										px={2}
										py={1}
										rounded="md"
										borderWidth="1px"
										borderColor="var(--wl-border-subtle)"
										bg="var(--wl-bg)"
										color="var(--wl-text-subtle)"
										_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
										_hover={{ bg: "var(--wl-bg-hover)" }}
									>
										<Box
											as="span"
											className="material-symbols-outlined"
											style={{ fontSize: 16 }}
										>
											chevron_left
										</Box>
									</IconButton>
									<Text
										fontSize="xs"
										color="var(--wl-text-subtle)"
										whiteSpace="nowrap"
										flexShrink={0}
									>
										Page {pagination.page} / {pagination.totalPages} (
										{pagination.total})
									</Text>
									<Box position="relative">
										<Button
											variant="ghost"
											size="sm"
											px={2}
											py={1}
											fontSize="xs"
											rounded="md"
											borderWidth="1px"
											bg="var(--wl-bg)"
											borderColor="var(--wl-border-subtle)"
											color="var(--wl-text-subtle)"
											_hover={{ bg: "var(--wl-bg-hover)" }}
											onClick={() =>
												setPageSizeDropdownOpen(!pageSizeDropdownOpen)
											}
										>
											{pageSize}/page
										</Button>
										{pageSizeDropdownOpen && (
											<>
												<Box
													position="fixed"
													inset={0}
													zIndex={10}
													onClick={() => setPageSizeDropdownOpen(false)}
													aria-hidden
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
													className="shadow-lg"
												>
													{PAGE_SIZE_OPTIONS.map((n) => (
														<Button
															key={n}
															variant="ghost"
															size="sm"
															w="full"
															justifyContent="flex-start"
															px={3}
															py={1.5}
															fontSize="xs"
															color="var(--wl-text)"
															_hover={{ bg: "var(--wl-bg-hover)" }}
															onClick={() => {
																onPageSizeChange(n);
																setPageSizeDropdownOpen(false);
															}}
														>
															{n}
														</Button>
													))}
												</Box>
											</>
										)}
									</Box>
								</Stack>
								<IconButton
									aria-label="Next page"
									variant="ghost"
									size="sm"
									onClick={pagination.onNext}
									disabled={pagination.page >= pagination.totalPages}
									px={2}
									py={1}
									rounded="md"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
									bg="var(--wl-bg)"
									color="var(--wl-text-subtle)"
									_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
									_hover={{ bg: "var(--wl-bg-hover)" }}
								>
									<Box
										as="span"
										className="material-symbols-outlined"
										style={{ fontSize: 16 }}
									>
										chevron_right
									</Box>
								</IconButton>
							</>
						) : (
							<Box position="relative">
								<Button
									variant="ghost"
									size="sm"
									px={2}
									py={1}
									fontSize="xs"
									rounded="md"
									borderWidth="1px"
									bg="var(--wl-bg)"
									borderColor="var(--wl-border-subtle)"
									color="var(--wl-text-subtle)"
									_hover={{ bg: "var(--wl-bg-hover)" }}
									onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
								>
									{pageSize} per page
								</Button>
								{pageSizeDropdownOpen && (
									<>
										<Box
											position="fixed"
											inset={0}
											zIndex={10}
											onClick={() => setPageSizeDropdownOpen(false)}
											aria-hidden
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
											className="shadow-lg"
										>
											{PAGE_SIZE_OPTIONS.map((n) => (
												<Button
													key={n}
													variant="ghost"
													size="sm"
													w="full"
													justifyContent="flex-start"
													px={3}
													py={1.5}
													fontSize="xs"
													color="var(--wl-text)"
													_hover={{ bg: "var(--wl-bg-hover)" }}
													onClick={() => {
														onPageSizeChange(n);
														setPageSizeDropdownOpen(false);
													}}
												>
													{n}
												</Button>
											))}
										</Box>
									</>
								)}
							</Box>
						)}
					</Box>
				)}
			</Box>
		</>
	);
}
