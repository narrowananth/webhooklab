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
			h="56px"
			minH="56px"
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
			{/* Logo + Connection status - compact left section */}
			<Flex align="center" gap={4} flexShrink={0} w={{ base: "auto", md: "313px" }} h={10}>
				<Link
					to="/"
					style={{
						fontWeight: 600,
						fontSize: "var(--wl-font-18)",
						color: "var(--wl-text)",
						textDecoration: "none",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<img
						src="/asset/logo/favicon.svg"
						alt="WebhookLab"
						style={{
							width: 32,
							height: 32,
							borderRadius: 6,
							objectFit: "contain",
							flexShrink: 0,
							verticalAlign: "middle",
						}}
					/>
					<Text as="span" display={{ base: "none", sm: "inline" }} lineHeight="1" alignSelf="center">
						WebhookLab
					</Text>
				</Link>
				<Box w="1px" h={6} bg="var(--wl-border-subtle)" />
				<Flex
					align="center"
					justify="center"
					gap={2}
					px={3}
					py={1.5}
					rounded="full"
					bg={connected ? "var(--wl-connected-bg)" : "var(--wl-disconnected-bg)"}
					borderWidth="0"
				>
					<Box
						w={2}
						h={2}
						rounded="full"
						bg={connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)"}
						alignSelf="center"
					/>
					<Text
						fontSize="12px"
						fontWeight={600}
						lineHeight="1"
						color={connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)"}
						textTransform="uppercase"
						letterSpacing="0.05em"
						alignSelf="center"
					>
						{connected ? "Connected" : "Disconnected"}
					</Text>
				</Flex>
			</Flex>

			{/* Centered webhook URL with copy - consistent height */}
			<Flex flex={1} maxW="470px" minW={0} px={{ base: 2, md: 6 }} align="center" h={10} justify="center">
				<Flex
					align="center"
					justify="center"
					flex={1}
					bg="var(--wl-bg)"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					rounded="md"
					overflow="hidden"
					h={9}
				>
					<Text
						px={3}
						py={1.5}
						fontSize="13px"
						fontFamily="var(--wl-font-mono)"
						lineHeight="1"
						color="var(--wl-text-muted)"
						flex={1}
						overflowX="auto"
						whiteSpace="nowrap"
						alignSelf="center"
						textAlign="center"
						css={{ "&::-webkit-scrollbar": { height: 4 } }}
					>
						{webhookUrl || "—"}
					</Text>
					<Box
						as="button"
						p={2}
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

			{/* Pause, Clear, Theme toggle - compact right section */}
			<Flex align="center" gap={2} flexShrink={0} w={{ base: "auto", md: "280px" }} h={10}>
				<Flex
					bg="var(--wl-bg)"
					p={1}
					rounded="lg"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					gap={0}
					align="center"
					h={9}
				>
					<Box
						as="button"
						display="flex"
						alignItems="center"
						gap={1.5}
						px={3}
						py={1.5}
						rounded="md"
						bg={isPaused ? "var(--wl-bg-muted)" : "var(--wl-bg-subtle)"}
						shadow={isPaused ? "none" : "sm"}
						fontSize="13px"
						fontWeight={500}
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
						gap={1.5}
						px={3}
						py={1.5}
						rounded="md"
						fontSize="13px"
						fontWeight={500}
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
					w={9}
					h={9}
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
						w={9}
						h={9}
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
