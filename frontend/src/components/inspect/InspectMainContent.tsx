/**
 * Main content: "Requests LIVE" header, activity list or empty state,
 * detail pane or placeholder. Responsive: stacked on mobile, side-by-side on desktop.
 */
import { Badge, Box, Button, Flex, Text } from "@chakra-ui/react";
import { RecentActivityList } from "./RecentActivityList";
import EmptyState from "./EmptyState";
import { InspectDetailPane } from "./InspectDetailPane";
import { useInspectStore } from "../../store/useInspectStore";
import type { WebhookEvent } from "../../types";

interface InspectMainContentProps {
	events: WebhookEvent[];
	onSelectEvent: (e: WebhookEvent) => void;
	onCopy: () => void;
	onClear: () => void;
}

export function InspectMainContent({
	events,
	onSelectEvent,
	onCopy,
	onClear,
}: InspectMainContentProps) {
	const selectedEvent = useInspectStore((s) => s.selectedEvent);

	return (
		<Flex
			flex={1}
			flexDir={{ base: "column", lg: "row" }}
			overflow="hidden"
			pb={{ base: 20, md: 12 }}
		>
			{/* Left: Activity list - full width on mobile, 40% on desktop */}
			<Box
				flex={{ base: "none", lg: "0 0 380px" }}
				w="full"
				overflow="auto"
				borderRightWidth={{ lg: "1px" }}
				borderColor="var(--wl-border-subtle)"
				p={{ base: 4, md: 6 }}
			>
				{/* Requests LIVE header */}
				<Flex justify="space-between" align="center" mb={4}>
					<Flex align="center" gap={2}>
						<Text fontSize="lg" fontWeight="semibold" color="var(--wl-text)">
							Requests
						</Text>
						<Badge colorPalette="blue" size="sm">
							LIVE
						</Badge>
					</Flex>
					<Flex gap={2}>
						<Button size="sm" colorPalette="blue" onClick={onCopy}>
							Copy URL
						</Button>
						<Button size="sm" variant="outline" onClick={onClear} aria-label="Clear">
							🗑
						</Button>
					</Flex>
				</Flex>

				<RecentActivityList events={events} onSelectEvent={onSelectEvent} />
			</Box>

			{/* Right: Detail pane or empty state */}
			<Box
				flex={1}
				display="flex"
				flexDir="column"
				overflow="hidden"
				bg="var(--wl-bg)"
			>
				{selectedEvent ? (
					<InspectDetailPane />
				) : (
					<EmptyState hasEvents={events.length > 0} />
				)}
			</Box>
		</Flex>
	);
}
