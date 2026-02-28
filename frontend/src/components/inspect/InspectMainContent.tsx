/**
 * Inspector panel: detail pane for selected request or empty state.
 * Request list is in RequestListPanel.
 */
import { Box } from "@chakra-ui/react";
import { EmptyState } from "./EmptyState";
import { InspectDetailPane } from "./InspectDetailPane";
import { useInspectStore } from "../../store/useInspectStore";
import type { WebhookEvent } from "../../types";

interface InspectMainContentProps {
	events: WebhookEvent[];
}

export function InspectMainContent({ events }: InspectMainContentProps) {
	const selectedEvent = useInspectStore((s) => s.selectedEvent);

	return (
		<Box
			flex={1}
			minH={0}
			minW={0}
			display="flex"
			flexDir="column"
			overflow="hidden"
			bg="var(--wl-bg)"
			// On mobile: take full width when viewing detail (list is hidden)
			w={{ base: selectedEvent ? "full" : "full", lg: "auto" }}
		>
			{selectedEvent ? (
				<InspectDetailPane />
			) : (
				<EmptyState hasEvents={events.length > 0} />
			)}
		</Box>
	);
}
