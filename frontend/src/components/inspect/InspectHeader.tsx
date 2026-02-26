/**
 * Responsive header: logo, search bar, connection status, action icons.
 * On mobile: compact layout. On desktop: full search bar.
 */
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useInspectStore } from "../../store/useInspectStore";

interface InspectHeaderProps {
	connected: boolean;
	onCopy: () => void;
	onClear: () => void;
	searchValue: string;
	onSearchChange: (v: string) => void;
}

export function InspectHeader({
	connected,
	onCopy,
	onClear,
	searchValue,
	onSearchChange,
}: InspectHeaderProps) {
	const { toggleTheme, theme, setSidebarOpen } = useInspectStore();

	return (
		<Box
			as="header"
			bg="var(--wl-bg-subtle)"
			borderBottomWidth="1px"
			borderColor="var(--wl-border-subtle)"
			px={{ base: 4, md: 6 }}
			py={{ base: 3, md: 4 }}
		>
			<Flex align="center" gap={{ base: 3, md: 6 }} flexWrap="wrap">
				{/* Logo - hidden on very small, show on sm+ */}
				<Link
					to="/"
					style={{
						fontWeight: "bold",
						fontSize: "1.125rem",
						color: "var(--wl-text)",
						textDecoration: "none",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<Box
						as="span"
						w={8}
						h={8}
						rounded="md"
						bg="var(--wl-accent)"
						opacity={0.9}
						display="flex"
						alignItems="center"
						justifyContent="center"
						fontSize="lg"
					>
						W
					</Box>
					<Box as="span" display={{ base: "none", sm: "inline" }}>
						WebhookLab
					</Box>
				</Link>

				{/* Search bar - flex grow, responsive */}
				<Flex
					flex={1}
					minW={{ base: 0, md: "200px" }}
					maxW={{ md: "400px" }}
					align="center"
					position="relative"
				>
					<Text
						position="absolute"
						left={3}
						color="var(--wl-text-subtle)"
						fontSize="sm"
						pointerEvents="none"
					>
						🔍
					</Text>
					<Input
						placeholder="Search headers, body, or params..."
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value)}
						pl={10}
						fontSize="sm"
						bg="var(--wl-bg)"
						borderColor="var(--wl-border)"
						color="var(--wl-text)"
					/>
				</Flex>

				{/* Connection status - pill style */}
				<Flex
					align="center"
					gap={2}
					px={3}
					py={1.5}
					rounded="full"
					borderWidth="1px"
					borderColor={connected ? "green.500" : "red.500"}
					bg="var(--wl-bg)"
				>
					<Box
						w={2}
						h={2}
						rounded="full"
						bg={connected ? "green.500" : "red.500"}
					/>
					<Text
						fontSize="xs"
						fontWeight="semibold"
						color={connected ? "green.500" : "red.500"}
					>
						{connected ? "CONNECTED" : "DISCONNECTED"}
					</Text>
				</Flex>

				{/* Action buttons - Copy URL, Clear */}
				<Flex align="center" gap={1}>
					<Button size="sm" colorPalette="blue" onClick={onCopy}>
						Copy URL
					</Button>
					<Button size="sm" variant="outline" onClick={onClear} aria-label="Clear">
						🗑
					</Button>
				</Flex>

				{/* Action icons: theme, settings, profile */}
				<Flex align="center" gap={1}>
					<Button
						size="sm"
						variant="ghost"
						onClick={toggleTheme}
						aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
					>
						{theme === "dark" ? "☀️" : "🌙"}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						aria-label="Notifications"
						display={{ base: "none", lg: "flex" }}
					>
						🔔
					</Button>
					<Button
						size="sm"
						variant="ghost"
						aria-label="Settings"
						display={{ base: "none", lg: "flex" }}
					>
						⚙️
					</Button>
					<Button
						size="sm"
						variant="ghost"
						aria-label="Profile"
						display={{ base: "none", lg: "flex" }}
					>
						👤
					</Button>
					{/* Mobile: filter toggle */}
					<Button
						size="sm"
						variant="ghost"
						aria-label="Filters"
						display={{ base: "flex", lg: "none" }}
						onClick={() => setSidebarOpen(true)}
					>
						☰
					</Button>
				</Flex>
			</Flex>
		</Box>
	);
}
