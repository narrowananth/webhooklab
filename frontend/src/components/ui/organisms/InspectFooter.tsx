import { Box, Stack, Text } from "@/components/ui/atoms";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { formatSize } from "@/lib";
import { useInspectStore } from "@/store/use-inspect-store";

export type InspectFooterProps = {
	webhookId?: string | null;
	requestCount: number;
	totalSizeBytes: number;
	statsLoading?: boolean;
	appVersion?: string;
};

export function InspectFooter({
	webhookId,
	requestCount,
	totalSizeBytes,
	statsLoading = false,
	appVersion = "1.0.0",
}: InspectFooterProps) {
	const { online, effectiveType } = useNetworkStatus();
	const wsConnected = useInspectStore((s) => s.wsConnected && !s.isPaused);
	const showOnline = wsConnected || online;
	const networkLabel = showOnline
		? effectiveType
			? effectiveType.toUpperCase()
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
			px="var(--wl-fluid-px)"
			py={2}
			minH="var(--wl-footer-bar-height)"
			display={{ base: "none", md: "block" }}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				fontSize="12px"
				color="var(--wl-text-subtle)"
				gap={3}
				flexWrap="wrap"
				lineHeight="1"
			>
				<Stack direction="row" alignItems="center" gap={3} flexWrap="wrap" lineHeight="1">
					{webhookId && (
						<>
							<Text as="span" lineHeight="1">
								{statsLoading
									? "…"
									: `${requestCount} request${requestCount === 1 ? "" : "s"}`}
							</Text>
							<Text as="span" lineHeight="1">
								{statsLoading ? "…" : formatSize(totalSizeBytes)}
							</Text>
						</>
					)}
					<Stack direction="row" alignItems="center" gap={2}>
						<Box
							w={2}
							h={2}
							borderRadius="full"
							bg={showOnline ? "var(--wl-success)" : "var(--wl-error)"}
							alignSelf="center"
						/>
						<Text as="span" lineHeight="1">
							{networkLabel}
						</Text>
					</Stack>
				</Stack>
				<Stack direction="row" alignItems="center" gap={3} lineHeight="1">
					<a
						href="https://github.com/liveflares/docs"
						className="text-xs text-text-primary"
						style={{ color: "var(--wl-accent)" }}
						rel="noopener noreferrer"
						target="_blank"
					>
						Docs
					</a>
					<Text as="span" fontSize="xs" lineHeight="1">
						v{appVersion}
					</Text>
				</Stack>
			</Stack>
		</Box>
	);
}
