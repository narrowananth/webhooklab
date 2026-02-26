/**
 * Mobile bottom navigation: Requests, Endpoints, Metrics, Settings.
 * Fixed at bottom on mobile, hidden on desktop.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useInspectStore } from "../../store/useInspectStore";

const NAV_ITEMS = [
	{ id: "requests" as const, label: "REQUESTS", icon: "📋" },
	{ id: "endpoints" as const, label: "ENDPOINTS", icon: "🔗" },
	{ id: "metrics" as const, label: "METRICS", icon: "📊" },
	{ id: "settings" as const, label: "SETTINGS", icon: "⚙️" },
];

export function BottomNav() {
	const { activeNav, setActiveNav } = useInspectStore();

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
			display={{ base: "block", md: "none" }}
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
