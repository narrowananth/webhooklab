/**
 * Header: logo, connection status, centered webhook URL, Pause/Clear icons, theme toggle, options menu.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInspectStore } from "../../store/useInspectStore";
import { truncateUrlEnd } from "../../utils/truncateUrl";

interface InspectHeaderProps {
	webhookUrl: string;
	connected: boolean;
	onCopy: () => void;
	onClear: () => void;
}

/** Approximate char width for 13px monospace (JetBrains Mono) */
const URL_CHAR_PX = 7.8;
const URL_PADDING_PX = 52; // copy button + horizontal padding

export function InspectHeader({ webhookUrl, connected, onCopy, onClear }: InspectHeaderProps) {
	const { isPaused, togglePaused, theme, toggleTheme, autoSelectNew, toggleAutoSelectNew } =
		useInspectStore();
	const [optionsOpen, setOptionsOpen] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);
	const urlContainerRef = useRef<HTMLDivElement>(null);
	const [displayUrl, setDisplayUrl] = useState(webhookUrl || "—");

	useEffect(() => {
		setDisplayUrl(webhookUrl || "—");
	}, [webhookUrl]);

	useEffect(() => {
		const el = urlContainerRef.current;
		if (!el) return;
		const updateDisplay = () => {
			const w = el.clientWidth;
			const maxChars = Math.max(12, Math.floor((w - URL_PADDING_PX) / URL_CHAR_PX));
			const url = webhookUrl || "—";
			setDisplayUrl(truncateUrlEnd(url, maxChars));
		};
		updateDisplay();
		const ro = new ResizeObserver(updateDisplay);
		ro.observe(el);
		return () => ro.disconnect();
	}, [webhookUrl]);

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
			h="var(--wl-header-height)"
			minH="var(--wl-header-height)"
			flexShrink={0}
			borderBottomWidth="1px"
			borderColor="var(--wl-border-subtle)"
			bg="var(--wl-bg-subtle)"
			px="var(--wl-fluid-px)"
			display="flex"
			flexWrap="wrap"
			alignItems="center"
			justifyContent="space-between"
			gap="var(--wl-fluid-lg)"
		>
			{/* Logo + Connection status - compact left section */}
			<Flex align="center" gap="var(--wl-fluid-md)" flexShrink={0} w={{ base: "auto", md: "min(313px, 28vw)" }} minW={0} h={10}>
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
							width: "var(--wl-logo-size)",
							height: "var(--wl-logo-size)",
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

			{/* Centered webhook URL with copy - expands to fill available space, trims when needed */}
			<Flex flex={1} minW={0} maxW="var(--wl-header-url-max)" px="var(--wl-fluid-sm)" align="center" h={10} justify="center">
				<Flex
					ref={urlContainerRef}
					align="center"
					justify="center"
					flex={1}
					minW={0}
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
						minW={0}
						overflow="hidden"
						textOverflow="ellipsis"
						whiteSpace="nowrap"
						alignSelf="center"
						textAlign="center"
						title={webhookUrl || "—"}
					>
						{displayUrl}
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

			{/* Pause, Clear, Theme toggle, Options - right section (each button separate) */}
			<Flex align="center" gap="var(--wl-fluid-sm)" flexShrink={0} w={{ base: "auto", md: "min(280px, 24vw)" }} minW={0} h={10}>
				<Box
					as="button"
					display="flex"
					alignItems="center"
					gap={1.5}
					px={3}
					py={1.5}
					rounded="lg"
					bg={isPaused ? "var(--wl-bg-muted)" : "var(--wl-bg)"}
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					shadow={isPaused ? "none" : "sm"}
					fontSize="13px"
					fontWeight={500}
					color={isPaused ? "var(--wl-text-subtle)" : "var(--wl-text)"}
					onClick={togglePaused}
					aria-label={isPaused ? "Resume" : "Pause"}
					_hover={{ bg: "var(--wl-bg-muted)" }}
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
					rounded="lg"
					bg="var(--wl-bg)"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					fontSize="13px"
					fontWeight={500}
					color="var(--wl-text-subtle)"
					_hover={{ color: "var(--wl-text)", bg: "var(--wl-bg-muted)" }}
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
