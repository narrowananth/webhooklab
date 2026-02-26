/**
 * Empty state: placeholder icon, instructions, feature cards.
 * Shown when no request is selected or when waiting for events.
 */
import { Box, Flex, Text } from "@chakra-ui/react";

interface EmptyStateProps {
	hasEvents?: boolean;
}

export default function EmptyState({ hasEvents = false }: EmptyStateProps) {
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
			<Text fontSize="sm" color="var(--wl-text-subtle)" mb={8} maxW="400px">
				{hasEvents
					? "Detailed payload, headers, and response data will appear here."
					: "Send a HTTP request to your unique URL to see the request details here in real-time. We support POST, GET, PUT, and more."}
			</Text>

			{/* Feature cards */}
			<Flex
				gap={4}
				flexWrap="wrap"
				justify="center"
				maxW="800px"
			>
				<FeatureCard
					icon="&lt; &gt;"
					title="Easy Integration"
					desc="Copy the URL into your service providers like Stripe or GitHub."
				/>
				<FeatureCard
					icon="📊"
					title="Real-time Debug"
					desc="Inspect payloads, headers, and query parameters instantly."
				/>
				<FeatureCard
					icon="↻"
					title="Replay Events"
					desc="Resend any captured request to your local server for testing."
				/>
			</Flex>
		</Box>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<Box
			p={4}
			rounded="lg"
			bg="var(--wl-bg-subtle)"
			borderWidth="1px"
			borderColor="var(--wl-border-subtle)"
			minW={{ base: "full", sm: "200px" }}
			maxW="280px"
			textAlign="left"
		>
			<Text fontSize="2xl" mb={2} fontFamily="mono">
				{icon}
			</Text>
			<Text fontSize="sm" fontWeight="semibold" color="var(--wl-text)" mb={1}>
				{title}
			</Text>
			<Text fontSize="xs" color="var(--wl-text-subtle)">
				{desc}
			</Text>
		</Box>
	);
}
