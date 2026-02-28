/**
 * Empty state: placeholder icon and instructions.
 * Shown when no request is selected or when waiting for events.
 */
import { Box, Text } from "@chakra-ui/react";

interface EmptyStateProps {
	hasEvents?: boolean;
}

export function EmptyState({ hasEvents = false }: EmptyStateProps) {
	return (
		<Box
			flex={1}
			display="flex"
			flexDir="column"
			alignItems="center"
			justifyContent="center"
			p="var(--wl-fluid-xl)"
			textAlign="center"
		>
			<Text fontSize="var(--wl-fluid-font-md)" fontWeight={600} lineHeight="1.4" color="var(--wl-text)" mb={2}>
				{hasEvents ? "Select a request to inspect" : "Waiting for webhook events..."}
			</Text>
			<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-subtle)" maxW="min(400px, 85vw)" lineHeight="1.5">
				{hasEvents
					? "Detailed payload, headers, and response data will appear here."
					: "Send a HTTP request to your unique URL to see the request details here in real-time. We support POST, GET, PUT, and more."}
			</Text>
		</Box>
	);
}
