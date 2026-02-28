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
			p={{ base: 6, md: 12 }}
			textAlign="center"
		>
			<Text fontSize="16px" fontWeight={600} lineHeight="22px" color="var(--wl-text)" mb={2}>
				{hasEvents ? "Select a request to inspect" : "Waiting for webhook events..."}
			</Text>
			<Text fontSize="14px" color="var(--wl-text-subtle)" maxW="400px" lineHeight="1.5">
				{hasEvents
					? "Detailed payload, headers, and response data will appear here."
					: "Send a HTTP request to your unique URL to see the request details here in real-time. We support POST, GET, PUT, and more."}
			</Text>
		</Box>
	);
}
