/**
 * Footer: WebSocket status, bandwidth, Docs, API Reference, version.
 */
import { Box, Flex, Text } from "@chakra-ui/react";

interface InspectFooterProps {
	connected: boolean;
}

export function InspectFooter({ connected }: InspectFooterProps) {
	return (
		<Box
			position="fixed"
			bottom={0}
			left={0}
			right={0}
			zIndex={20}
			bg="var(--wl-bg-subtle)"
			borderTopWidth="1px"
			borderColor="var(--wl-border-subtle)"
			px={4}
			py={2}
			display={{ base: "none", md: "block" }}
		>
			<Flex justify="space-between" align="center" fontSize="xs" color="var(--wl-text-subtle)">
				<Flex align="center" gap={4}>
					<Flex align="center" gap={2}>
						<Box
							w={2}
							h={2}
							rounded="full"
							bg={connected ? "green.500" : "red.500"}
						/>
						<Text>WebSocket {connected ? "Active" : "Inactive"}</Text>
					</Flex>
					<Text>Total bandwidth: 0 KB</Text>
				</Flex>
				<Flex align="center" gap={4}>
					<a href="#" style={{ color: "var(--wl-accent)" }}>Docs</a>
					<a href="#" style={{ color: "var(--wl-accent)" }}>API Reference</a>
					<Text>v1.0.0</Text>
				</Flex>
			</Flex>
		</Box>
	);
}
