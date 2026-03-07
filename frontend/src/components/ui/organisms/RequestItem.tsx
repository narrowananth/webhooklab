import { Box, Button, Stack, Text } from "@/components/ui/atoms";
import { getMethodBadgeStyle } from "@/constants/method-badges";
import { formatSize, getEventTimestamp, getRequestSizeBytes, parseDate } from "@/lib";
import type { WebhookEvent } from "@/types";
import { z } from "zod";

function getStatusLabel(status: number | undefined): string {
	const s = status ?? 200;
	if (s >= 200 && s < 300) return "OK";
	if (s >= 400 && s < 500) return "Client error";
	if (s >= 500) return "Server error";
	return "OK";
}

const requestItemPropsSchema = z.object({
	event: z.custom<WebhookEvent>(),
	isSelected: z.boolean(),
	onSelect: z.function().args().returns(z.void()),
	isNew: z.boolean().optional(),
});

export type RequestItemProps = z.infer<typeof requestItemPropsSchema>;

export function RequestItem({ event, isSelected, onSelect, isNew }: RequestItemProps) {
	const badgeStyle = getMethodBadgeStyle(event.method);
	const ts = getEventTimestamp(event);
	const dateTime = ts
		? (parseDate(ts)?.toLocaleString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}) ?? "—")
		: "—";

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={onSelect}
			w="full"
			minW={0}
			h="auto"
			minH="72px"
			textAlign="left"
			justifyContent="flex-start"
			alignItems="stretch"
			flexDirection="column"
			gap={2.5}
			px={4}
			py={3}
			rounded="lg"
			cursor="pointer"
			transition="all 0.15s"
			bg={isSelected ? "var(--wl-elevated)" : "transparent"}
			borderWidth="1px"
			borderColor={isSelected ? "var(--wl-border)" : "transparent"}
			boxShadow={isSelected ? "sm" : undefined}
			_hover={
				!isSelected ? { bg: "var(--wl-elevated)", transform: "translateX(2px)" } : undefined
			}
			ring={isNew ? 1 : undefined}
			ringColor={isNew ? "var(--wl-success)" : undefined}
			opacity={isNew ? 0.9 : undefined}
			className={isNew ? "animate-[pulse-border_800ms_ease-out]" : undefined}
			position="relative"
		>
			{isSelected && (
				<Box
					as="span"
					position="absolute"
					left={0}
					top={0}
					h="full"
					w={1.5}
					bg="var(--wl-accent)"
					roundedLeft="lg"
				/>
			)}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				gap={3}
				lineHeight="1"
			>
				<Stack direction="row" alignItems="center" gap={3} minW={0}>
					<Box
						as="span"
						px={2}
						py={0.5}
						fontSize="11px"
						fontWeight={600}
						textTransform="uppercase"
						letterSpacing="wider"
						rounded="md"
						borderWidth="1px"
						borderColor="var(--wl-border-subtle)"
						bg={badgeStyle.bg}
						color={badgeStyle.fg}
					>
						{event.method.toUpperCase() === "DELETE"
							? "DEL"
							: event.method.toUpperCase()}
					</Box>
					<Text as="span" fontSize="sm" fontWeight={500} color="var(--wl-text)" truncate>
						{event.status != null ? event.status : 200} {getStatusLabel(event.status)}
					</Text>
				</Stack>
				<Text as="span" fontSize="xs" color="var(--wl-text-secondary)" flexShrink={0}>
					{dateTime}
				</Text>
			</Stack>
			<Stack
				direction="row"
				alignItems="center"
				gap={4}
				fontSize="xs"
				color="var(--wl-text-secondary)"
				lineHeight="1"
				minW={0}
			>
				<Stack direction="row" alignItems="center" gap={1.5} as="span" minW={0}>
					<Box
						as="span"
						className="material-symbols-outlined"
						fontSize="sm"
						color="var(--wl-text-subtle)"
						flexShrink={0}
					>
						public
					</Box>
					<Text as="span" truncate>{event.ip ?? "—"}</Text>
				</Stack>
				<Stack direction="row" alignItems="center" gap={1.5} as="span" flexShrink={0}>
					<Box
						as="span"
						className="material-symbols-outlined"
						fontSize="sm"
						color="var(--wl-text-subtle)"
					>
						data_object
					</Box>
					<Text as="span">{formatSize(getRequestSizeBytes(event))}</Text>
				</Stack>
				<Text as="span" flexShrink={0}>
					#{event.id}
				</Text>
			</Stack>
		</Button>
	);
}
