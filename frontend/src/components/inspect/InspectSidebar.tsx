/**
 * Left sidebar: search bar, collapsible filters (Method, IP, Request ID),
 * and the list of captured requests.
 *
 * Uses Zustand for: searchFilter, methodFilter, ipFilter, requestIdFilter,
 * selectedEvent. All filter state is maintained locally for instant UI updates.
 */
import { Badge, Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import type { WebhookEvent } from "../../types";
import { METHOD_COLORS } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";

interface InspectSidebarProps {
	events: WebhookEvent[];
	onSelectEvent: (event: WebhookEvent) => void;
}

export function InspectSidebar({ events, onSelectEvent }: InspectSidebarProps) {
	const [filtersOpen, setFiltersOpen] = useState(true);
	const {
		searchFilter,
		setSearchFilter,
		methodFilter,
		setMethodFilter,
		ipFilter,
		setIpFilter,
		requestIdFilter,
		setRequestIdFilter,
		selectedEvent,
	} = useInspectStore();

	// Apply filters to events
	const filteredEvents = events.filter((e) => {
		if (searchFilter) {
			const q = searchFilter.toLowerCase();
			const bodyStr = e.rawBody ?? JSON.stringify(e.body ?? {});
			const match =
				e.method.toLowerCase().includes(q) ||
				bodyStr.toLowerCase().includes(q) ||
				JSON.stringify(e.headers ?? {}).toLowerCase().includes(q) ||
				JSON.stringify(e.queryParams ?? {}).toLowerCase().includes(q);
			if (!match) return false;
		}
		if (methodFilter && e.method !== methodFilter) return false;
		if (ipFilter && (!e.ip || !e.ip.includes(ipFilter))) return false;
		if (requestIdFilter) {
			const id = String(e.id);
			if (!id.includes(requestIdFilter.replace("#", ""))) return false;
		}
		return true;
	});

	return (
		<Box
			w="380px"
			minW="320px"
			flexShrink={0}
			bg="var(--wl-bg-subtle)"
			borderRightWidth="1px"
			borderColor="var(--wl-border-subtle)"
			display="flex"
			flexDir="column"
			overflow="hidden"
		>
			{/* Search */}
			<Box p={4} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
				<Input
					placeholder="Search headers, body, params..."
					value={searchFilter}
					onChange={(e) => setSearchFilter(e.target.value)}
					bg="var(--wl-bg)"
					borderColor="var(--wl-border)"
					size="sm"
				/>
			</Box>

			{/* Filters - collapsible */}
			<Box borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
				<Button
					variant="ghost"
					size="sm"
					w="full"
					justifyContent="space-between"
					px={4}
					py={3}
					onClick={() => setFiltersOpen(!filtersOpen)}
				>
					<Text fontSize="xs" fontWeight="semibold" color="var(--wl-text-muted)">
						FILTERS
					</Text>
					<Text>{filtersOpen ? "▼" : "▶"}</Text>
				</Button>
				{filtersOpen && (
					<Box px={4} pb={4} display="flex" flexDir="column" gap={3}>
						<Box>
							<Text fontSize="xs" color="var(--wl-text-subtle)" mb={1}>
								Method
							</Text>
							<Input
								placeholder="All Methods"
								value={methodFilter}
								onChange={(e) => setMethodFilter(e.target.value)}
								bg="var(--wl-bg)"
								borderColor="var(--wl-border)"
								size="sm"
							/>
						</Box>
						<Box>
							<Text fontSize="xs" color="var(--wl-text-subtle)" mb={1}>
								IP Address
							</Text>
							<Input
								placeholder="e.g. 192.168.1.1"
								value={ipFilter}
								onChange={(e) => setIpFilter(e.target.value)}
								bg="var(--wl-bg)"
								borderColor="var(--wl-border)"
								size="sm"
							/>
						</Box>
						<Box>
							<Text fontSize="xs" color="var(--wl-text-subtle)" mb={1}>
								Request ID
							</Text>
							<Input
								placeholder="e.g. #42"
								value={requestIdFilter}
								onChange={(e) => setRequestIdFilter(e.target.value)}
								bg="var(--wl-bg)"
								borderColor="var(--wl-border)"
								size="sm"
							/>
						</Box>
					</Box>
				)}
			</Box>

			{/* Requests list */}
			<Box flex={1} overflow="auto">
				<Box px={4} py={2} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
					<Text fontSize="xs" fontWeight="semibold" color="var(--wl-text-muted)">
						REQUESTS
					</Text>
				</Box>
				{filteredEvents.length === 0 ? (
					<Box py={12} textAlign="center">
						<Text fontSize="sm" color="var(--wl-text-subtle)">
							Waiting for webhook events...
						</Text>
					</Box>
				) : (
					filteredEvents.map((event) => {
						const isSelected = selectedEvent?.id === event.id;
						const time = new Date(event.timestamp).toLocaleTimeString(undefined, {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						});
						const contentType =
							event.headers?.["content-type"] ?? event.headers?.["Content-Type"] ?? "No content type";
						return (
							<Box
								key={event.id}
								as="button"
								w="full"
								textAlign="left"
								px={4}
								py={3}
								borderBottomWidth="1px"
								borderColor="var(--wl-border-subtle)"
								bg={isSelected ? "var(--wl-selected-bg)" : "transparent"}
								borderLeftWidth="3px"
								borderLeftColor={
									isSelected ? "var(--wl-selected-border)" : "transparent"
								}
								_hover={{
									bg: isSelected ? "var(--wl-selected-bg)" : "var(--wl-bg-muted)",
								}}
								onClick={() => onSelectEvent(event)}
							>
								<Flex align="center" gap={2} mb={1}>
									<Badge
										colorPalette={METHOD_COLORS[event.method] ?? "gray"}
										size="sm"
										fontFamily="mono"
									>
										{event.method}
									</Badge>
									<Text fontSize="xs" color="var(--wl-text-muted)" fontFamily="mono">
										{event.ip ?? "—"}
									</Text>
								</Flex>
								<Flex align="center" gap={2}>
									<Text fontSize="xs" color="var(--wl-text-subtle)" fontFamily="mono">
										{time}
									</Text>
									<Text fontSize="xs" color="var(--wl-text-muted)" fontFamily="mono">
										#{event.id}
									</Text>
								</Flex>
								<Text
									fontSize="xs"
									color="var(--wl-text-subtle)"
									mt={1}
									truncate
								>
									{contentType}
								</Text>
							</Box>
						);
					})
				)}
			</Box>
		</Box>
	);
}
