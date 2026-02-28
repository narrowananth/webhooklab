/**
 * Header: logo, connection status, centered webhook URL, Pause/Clear icons, theme toggle, options menu.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInspectStore } from "../../store/useInspectStore";

interface InspectHeaderProps {
	webhookUrl: string;
	connected: boolean;
	onCopy: () => void;
	onClear: () => void;
}

export function InspectHeader({ webhookUrl, connected, onCopy, onClear }: InspectHeaderProps) {
	const { isPaused, togglePaused, theme, toggleTheme, autoSelectNew, toggleAutoSelectNew } =
		useInspectStore();
	const [optionsOpen, setOptionsOpen] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
				setOptionsOpen(false);
			}
		};
		document.addEventListener("click", handler);
		return () => document.removeEventListener("click", handler);
	}, []);

	return (
		<Box
			as="header"
			h={16}
			flexShrink={0}
			borderBottomWidth="1px"
			borderColor="var(--wl-border-subtle)"
			bg="var(--wl-bg-subtle)"
			px={{ base: 4, md: 6 }}
			display="flex"
			flexWrap="wrap"
			alignItems="center"
			justifyContent="space-between"
			gap={6}
		>
			{/* Logo + Connection status */}
			<Flex align="center" gap={6} flexShrink={0}>
				<Link
					to="/"
					style={{
						fontWeight: "bold",
						fontSize: "var(--wl-font-lg)",
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
						display="flex"
						alignItems="center"
						justifyContent="center"
						fontSize="lg"
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)", color: "white" }}>
							webhook
						</span>
					</Box>
					<Text as="span" display={{ base: "none", sm: "inline" }}>
						WebhookLab
					</Text>
				</Link>
				<Box w="1px" h={6} bg="var(--wl-border-subtle)" />
				<Flex
					align="center"
					gap={2}
					px={3}
					py={1.5}
					rounded="full"
					bg={connected ? "var(--wl-success-muted)" : "var(--wl-error-muted)"}
					borderWidth="0"
				>
					<Box
						w={2}
						h={2}
						rounded="full"
						bg={connected ? "var(--wl-success)" : "var(--wl-error)"}
					/>
					<Text
						fontSize="xs"
						fontWeight="semibold"
						color={connected ? "var(--wl-success)" : "var(--wl-error)"}
						textTransform="uppercase"
						letterSpacing="wider"
					>
						{connected ? "Connected" : "Disconnected"}
					</Text>
				</Flex>
			</Flex>

			{/* Centered webhook URL with copy */}
			<Flex flex={1} maxW="2xl" px={{ base: 2, md: 8 }} minW={0}>
				<Flex
					align="center"
					flex={1}
					bg="var(--wl-bg)"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					rounded="md"
					overflow="hidden"
					minH={0}
				>
					<Text
						px={2}
						py={1}
						fontSize="xs"
						fontFamily="mono"
						lineHeight="tight"
						color="var(--wl-text-muted)"
						flex={1}
						overflowX="auto"
						whiteSpace="nowrap"
						css={{ "&::-webkit-scrollbar": { height: 4 } }}
					>
						{webhookUrl || "—"}
					</Text>
					<Box
						as="button"
						p={1.5}
						display="flex"
						alignItems="center"
						justifyContent="center"
						onClick={onCopy}
						aria-label="Copy URL"
						_hover={{ bg: "var(--wl-bg-muted)" }}
						color="var(--wl-text-subtle)"
						transition="background 0.15s"
						borderLeftWidth="1px"
						borderColor="var(--wl-border-subtle)"
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)" }}>
							content_copy
						</span>
					</Box>
				</Flex>
			</Flex>

			{/* Pause, Clear, Theme toggle */}
			<Flex align="center" gap={3} flexShrink={0}>
				<Flex
					bg="var(--wl-bg)"
					p={1}
					rounded="lg"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					gap={0}
				>
					<Box
						as="button"
						display="flex"
						alignItems="center"
						gap={2}
						px={4}
						py={1.5}
						rounded="md"
						bg={isPaused ? "var(--wl-bg-muted)" : "var(--wl-bg-subtle)"}
						shadow={isPaused ? "none" : "sm"}
						fontSize="sm"
						fontWeight="medium"
						color={isPaused ? "var(--wl-text-subtle)" : "var(--wl-text)"}
						onClick={togglePaused}
						aria-label={isPaused ? "Resume" : "Pause"}
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)" }}>
							pause
						</span>
						<Text as="span" display={{ base: "none", md: "inline" }}>
							Pause
						</Text>
					</Box>
					<Box
						as="button"
						display="flex"
						alignItems="center"
						gap={2}
						px={4}
						py={1.5}
						rounded="md"
						fontSize="sm"
						fontWeight="medium"
						color="var(--wl-text-subtle)"
						_hover={{ color: "var(--wl-text)" }}
						onClick={onClear}
						aria-label="Clear"
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-lg)" }}>
							delete_sweep
						</span>
						<Text as="span" display={{ base: "none", md: "inline" }}>
							Clear
						</Text>
					</Box>
				</Flex>
				<Box
					as="button"
					p={2}
					rounded="lg"
					display="flex"
					alignItems="center"
					justifyContent="center"
					_hover={{ bg: "var(--wl-bg-muted)" }}
					color="var(--wl-text-subtle)"
					aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
					onClick={toggleTheme}
				>
					<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
						{theme === "dark" ? "light_mode" : "dark_mode"}
					</span>
				</Box>
				{/* Options menu */}
				<Box position="relative" ref={optionsRef}>
					<Box
						as="button"
						p={2}
						rounded="lg"
						display="flex"
						alignItems="center"
						justifyContent="center"
						_hover={{ bg: "var(--wl-bg-muted)" }}
						color="var(--wl-text-subtle)"
						aria-label="Options"
						aria-expanded={optionsOpen}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							setOptionsOpen((v) => !v);
						}}
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
							more_vert
						</span>
					</Box>
					{optionsOpen && (
						<Box
							position="absolute"
							right={0}
							top="100%"
							mt={1}
							minW="220px"
							py={1}
							bg="var(--wl-bg)"
							borderWidth="1px"
							borderColor="var(--wl-border-subtle)"
							rounded="lg"
							shadow="lg"
							zIndex={50}
						>
							<Box
								as="button"
								w="full"
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								px={4}
								py={2}
								textAlign="left"
								fontSize="sm"
								color="var(--wl-text)"
								_hover={{ bg: "var(--wl-bg-muted)" }}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									toggleAutoSelectNew();
								}}
							>
								<Text>Auto-select new requests</Text>
								<Box
									w={8}
									h={4}
									rounded="full"
									bg={autoSelectNew ? "var(--wl-accent)" : "var(--wl-bg-muted)"}
									position="relative"
									transition="background 0.2s"
								>
									<Box
										position="absolute"
										top={1}
										left={autoSelectNew ? 5 : 1}
										w={2}
										h={2}
										rounded="full"
										bg="white"
										transition="left 0.2s"
									/>
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			</Flex>
		</Box>
	);
}
