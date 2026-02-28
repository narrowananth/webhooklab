/**
 * Mobile bottom navigation: View Requests (when viewing detail) or Requests/Endpoints/Metrics/Settings.
 * Hidden on all viewports - not used on mobile/tablet per design.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useInspectStore } from "../../store/useInspectStore";

const NAV_ITEMS = [
	{ id: "requests" as const, label: "REQUESTS", icon: "📋" },
	{ id: "endpoints" as const, label: "ENDPOINTS", icon: "🔗" },
	{ id: "metrics" as const, label: "METRICS", icon: "📊" },
	{ id: "settings" as const, label: "SETTINGS", icon: "⚙️" },
];

interface BottomNavProps {
	eventsCount?: number;
}

export function BottomNav({ eventsCount = 0 }: BottomNavProps) {
	const { activeNav, setActiveNav, selectedEvent, setSelectedEvent } = useInspectStore();

	// When viewing a request detail on mobile, show "View Requests" to go back
	if (selectedEvent) {
		return (
			<Box
				position="fixed"
				bottom={0}
				left={0}
				right={0}
				zIndex={30}
				bg="var(--wl-bg-subtle)"
				borderTopWidth="1px"
				borderColor="var(--wl-border-subtle)"
				display="none"
				p={4}
			>
				<Box
					as="button"
					w="full"
					display="flex"
					alignItems="center"
					justifyContent="center"
					gap={2}
					py={3}
					px={4}
					rounded="lg"
					bg="var(--wl-accent)"
					color="white"
					fontWeight="semibold"
					fontSize="sm"
					onClick={() => setSelectedEvent(null)}
				>
					<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
						format_list_bulleted
					</span>
					View Requests
					{eventsCount > 0 && (
						<Box
							ml="auto"
							px={2}
							py={0.5}
							rounded="full"
							bg="white"
							color="var(--wl-accent)"
							fontSize="xs"
							fontWeight="bold"
						>
							{eventsCount} {eventsCount === 1 ? "request" : "requests"}
						</Box>
					)}
				</Box>
			</Box>
		);
	}

	return (
		<Box
			position="fixed"
			bottom={0}
			left={0}
			right={0}
			zIndex={30}
			bg="var(--wl-bg-subtle)"
			borderTopWidth="1px"
			borderColor="var(--wl-border-subtle)"
			display="none"
		>
			<Flex justify="space-around" py={4} px={2}>
				{NAV_ITEMS.map((item) => {
					const isActive = activeNav === item.id;
					return (
						<Box
							key={item.id}
							as="button"
							display="flex"
							flexDir="column"
							alignItems="center"
							gap={1}
							onClick={() => setActiveNav(item.id)}
						>
							<Text fontSize="xl" opacity={isActive ? 1 : 0.6}>
								{item.icon}
							</Text>
							<Text
								fontSize="xs"
								fontWeight={isActive ? "semibold" : "normal"}
								color={isActive ? "var(--wl-accent)" : "var(--wl-text-muted)"}
							>
								{item.label}
							</Text>
						</Box>
					);
				})}
			</Flex>
		</Box>
	);
}
