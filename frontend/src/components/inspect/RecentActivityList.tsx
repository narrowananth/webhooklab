/**
 * Recent Activity list: method tag, path, IP • id, relative timestamp.
 * Responsive: stacked on mobile, compact on desktop.
 */
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import type { WebhookEvent } from "../../types";
import { useInspectStore } from "../../store/useInspectStore";
import { METHOD_BADGE_STYLES, BADGE_STYLE_GRAY } from "../../constants";
import { formatRelativeTime } from "../../utils/relativeTime";
import { getPathFromUrl, truncatePath } from "../../utils/truncateUrl";

interface RecentActivityListProps {
	events: WebhookEvent[];
	onSelectEvent: (event: WebhookEvent) => void;
}

export function RecentActivityList({ events, onSelectEvent }: RecentActivityListProps) {
	const selectedEvent = useInspectStore((s) => s.selectedEvent);

	return (
		<Box>
			<Text
				fontSize="xs"
				fontWeight="semibold"
				color="var(--wl-text-muted)"
				mb={3}
				textTransform="uppercase"
			>
				Recent Activity
			</Text>
			{events.length === 0 ? (
				<Text fontSize="sm" color="var(--wl-text-subtle)" py={8}>
					No requests yet
				</Text>
			) : (
				<Flex flexDir="column" gap={2}>
					{events.map((event) => {
						const isSelected = selectedEvent?.id === event.id;
						const path = getPathFromUrl(event.url);
						const shortPath = truncatePath(path, 32);
						const shortId = `id_${String(event.id).slice(-6)}`;

						return (
							<Box
								key={event.id}
								as="button"
								w="full"
								textAlign="left"
								p={4}
								rounded="lg"
								bg={isSelected ? "var(--wl-selected-bg)" : "var(--wl-bg-subtle)"}
								borderWidth="1px"
								borderColor={isSelected ? "var(--wl-selected-border)" : "var(--wl-border-subtle)"}
								_hover={{
									bg: isSelected ? "var(--wl-selected-bg)" : "var(--wl-bg-muted)",
								}}
								onClick={() => onSelectEvent(event)}
							>
								<Flex justify="space-between" align="flex-start" gap={3}>
									<Flex flex={1} flexDir="column" gap={1} minW={0}>
										<Flex align="center" gap={2} flexWrap="wrap">
											<Badge
												bg={METHOD_BADGE_STYLES[event.method]?.bg ?? BADGE_STYLE_GRAY.bg}
												color={METHOD_BADGE_STYLES[event.method]?.fg ?? BADGE_STYLE_GRAY.fg}
												size="sm"
												fontFamily="mono"
											>
												{event.method === "DELETE" ? "DEL" : event.method}
											</Badge>
											<Text
												fontSize="sm"
												fontWeight="medium"
												color="var(--wl-text)"
												truncate
											>
												{shortPath}
											</Text>
										</Flex>
										<Text fontSize="xs" color="var(--wl-text-subtle)">
											IP: {event.ip ?? "—"} • {shortId}
										</Text>
									</Flex>
									<Text
										fontSize="xs"
										color="var(--wl-text-subtle)"
										flexShrink={0}
									>
										{formatRelativeTime(event.timestamp)}
									</Text>
								</Flex>
							</Box>
						);
					})}
				</Flex>
			)}
		</Box>
	);
}
