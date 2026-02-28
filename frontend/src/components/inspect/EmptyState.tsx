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
			{/* Target/select icon */}
			<Box
				w={{ base: 16, md: 24 }}
				h={{ base: 16, md: 24 }}
				mb={6}
				rounded="full"
				bg="var(--wl-bg-subtle)"
				borderWidth="2px"
				borderColor="var(--wl-accent)"
				display="flex"
				alignItems="center"
				justifyContent="center"
				fontSize="4xl"
			>
				◎
			</Box>
			<Text fontSize="xl" fontWeight="semibold" color="var(--wl-text)" mb={2}>
				{hasEvents ? "Select a request to inspect" : "Waiting for webhook events..."}
			</Text>
			<Text fontSize="sm" color="var(--wl-text-subtle)" maxW="400px">
				{hasEvents
					? "Detailed payload, headers, and response data will appear here."
					: "Send a HTTP request to your unique URL to see the request details here in real-time. We support POST, GET, PUT, and more."}
			</Text>
		</Box>
	);
}
