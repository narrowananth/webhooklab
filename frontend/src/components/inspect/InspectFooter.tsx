/**
 * Footer: WebSocket status, request count, total size, network signal,
 * session bandwidth, Docs link, product version.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import pkg from "../../../package.json";

const APP_VERSION = (pkg as { version?: string }).version ?? "1.0.0";

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface InspectFooterProps {
	webhookId: string | null;
	requestCount: number;
	totalSizeBytes: number;
	statsLoading?: boolean;
}

export function InspectFooter({
	webhookId,
	requestCount,
	totalSizeBytes,
	statsLoading = false,
}: InspectFooterProps) {
	const { online, effectiveType } = useNetworkStatus();

	const networkLabel = online
		? effectiveType
			? `${effectiveType.toUpperCase()}`
			: "Online"
		: "Offline";

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
			minH={10}
			display={{ base: "none", md: "block" }}
		>
			<Flex
				justify="space-between"
				align="center"
				fontSize="12px"
				color="var(--wl-text-subtle)"
				gap={4}
				flexWrap="wrap"
			>
				<Flex align="center" gap={4} flexWrap="wrap">
					{webhookId && (
						<>
							<Text>
								{statsLoading
									? "…"
									: `${requestCount} request${requestCount === 1 ? "" : "s"}`}
							</Text>
							<Text>
								{statsLoading ? "…" : formatBytes(totalSizeBytes)}
							</Text>
						</>
					)}
					<Flex align="center" gap={2}>
						<Box
							w={2}
							h={2}
							rounded="full"
							bg={online ? "var(--wl-success)" : "var(--wl-error)"}
							alignSelf="center"
						/>
						<Text lineHeight="1">{networkLabel}</Text>
					</Flex>
				</Flex>
				<Flex align="center" gap={4}>
					<a href="#" style={{ color: "var(--wl-accent)" }}>
						Docs
					</a>
					<Text>v{APP_VERSION}</Text>
				</Flex>
			</Flex>
		</Box>
	);
}
