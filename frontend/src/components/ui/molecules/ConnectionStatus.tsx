import { Box, Stack, Text } from "@/components/ui/atoms";
import { forwardRef } from "react";
import { z } from "zod";

const connectionStatusSchema = z.object({
	connected: z.boolean(),
	label: z.string().optional(),
	className: z.string().optional(),
});

export type ConnectionStatusProps = z.infer<typeof connectionStatusSchema>;

export const ConnectionStatus = forwardRef<HTMLDivElement, ConnectionStatusProps>(
	function ConnectionStatus({ connected, label: labelProp, className }, ref) {
		const label = labelProp ?? (connected ? "Online" : "Offline");
		const bg = connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)";
		const color = connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)";
		return (
			<Stack ref={ref} direction="row" alignItems="center" gap={2} className={className}>
				<Box w={2} h={2} borderRadius="full" bg={bg} alignSelf="center" flexShrink={0} />
				<Text variant="caption" color={color} lineHeight="1">
					{label}
				</Text>
			</Stack>
		);
	},
);
