import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import type { WebhookEvent } from "../types";

interface EventListProps {
	events: WebhookEvent[];
	onSelect: (event: WebhookEvent) => void;
	methodColors: Record<string, string>;
}

export function EventList({ events, onSelect, methodColors }: EventListProps) {
	if (events.length === 0) {
		return (
			<Box
				py={16}
				textAlign="center"
				bg="slate.900"
				rounded="xl"
				borderWidth="1px"
				borderColor="slate.700"
				borderStyle="dashed"
			>
				<Text color="slate.500" fontSize="lg">
					Waiting for webhook events...
				</Text>
				<Text color="slate.600" fontSize="sm" mt={2}>
					Send requests to your webhook URL to see them here
				</Text>
			</Box>
		);
	}

	return (
		<Box
			bg="slate.900"
			rounded="xl"
			borderWidth="1px"
			borderColor="slate.700"
			overflow="hidden"
		>
			{events.map((event) => (
				<Box
					key={event.id}
					as="button"
					w="full"
					textAlign="left"
					p={4}
					borderBottomWidth="1px"
					borderColor="slate.700"
					_last={{ borderBottomWidth: 0 }}
					_hover={{ bg: "slate.800" }}
					onClick={() => onSelect(event)}
				>
					<Flex align="center" gap={4}>
						<Badge
							colorPalette={methodColors[event.method] ?? "gray"}
							size="sm"
							fontFamily="mono"
						>
							{event.method}
						</Badge>
						<Text
							fontSize="sm"
							color="slate.400"
							fontFamily="mono"
							truncate
							flex={1}
						>
							{new Date(event.timestamp).toLocaleString()}
						</Text>
						{event.ip && (
							<Text fontSize="xs" color="slate.500" fontFamily="mono">
								{event.ip}
							</Text>
						)}
					</Flex>
				</Box>
			))}
		</Box>
	);
}
