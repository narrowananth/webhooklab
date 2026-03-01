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
	const [urlCopied, setUrlCopied] = useState(false);
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
			{/* Logo - left section (matches sidebar width for alignment) */}
			<Flex align="center" flexShrink={0} w={{ base: "auto", lg: "var(--wl-sidebar-width)" }} minW={{ base: 0, lg: "var(--wl-sidebar-min-width)" }} maxW={{ lg: "var(--wl-sidebar-max-width)" }} h={10}>
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
						onClick={async () => {
							try {
								await onCopy();
								setUrlCopied(true);
								setTimeout(() => setUrlCopied(false), 2000);
							} catch {}
						}}
						aria-label={urlCopied ? "Copied" : "Copy URL"}
						_hover={{ bg: "var(--wl-bg-hover)" }}
						color={urlCopied ? "var(--wl-success)" : "var(--wl-text-subtle)"}
						transition="color 0.2s, background 0.15s"
						borderLeftWidth="1px"
						borderColor="var(--wl-border-subtle)"
					>
						<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-md)" }}>
							{urlCopied ? "check" : "content_copy"}
						</span>
					</Box>
				</Flex>
			</Flex>

			{/* Right section: Connected → Pause → Clear → Theme toggle → Options (order fixed, no wrap) */}
			<Flex align="center" gap="var(--wl-fluid-sm)" flexShrink={0} flexWrap="nowrap" minW={0} h={10}>
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
				<Box
					as="button"
					w={9}
					h={9}
					p={2}
					rounded="lg"
					display="flex"
					alignItems="center"
					justifyContent="center"
					bg={isPaused ? "var(--wl-bg-muted)" : "var(--wl-bg)"}
					color={isPaused ? "var(--wl-text-subtle)" : "var(--wl-text)"}
					onClick={togglePaused}
					aria-label={isPaused ? "Resume" : "Pause"}
					_hover={{ bg: "var(--wl-bg-hover)" }}
				>
					<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
						{isPaused ? "play_arrow" : "pause"}
					</span>
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
					_hover={{ bg: "var(--wl-bg-hover)" }}
					color="var(--wl-text-subtle)"
					onClick={onClear}
					aria-label="Clear"
				>
					<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
						delete_sweep
					</span>
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
					_hover={{ bg: "var(--wl-bg-hover)" }}
					color="var(--wl-text-subtle)"
					aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
					onClick={toggleTheme}
				>
					<span className="material-symbols-outlined" style={{ fontSize: "var(--wl-icon-xl)" }}>
						{theme === "dark" ? "light_mode" : "dark_mode"}
					</span>
				</Box>
				{/* Options menu - last */}
				<Box position="relative" ref={optionsRef}>
					<Box
						as="button"
						w={9}
						h={9}
						rounded="lg"
						display="flex"
						alignItems="center"
						justifyContent="center"
						_hover={{ bg: "var(--wl-bg-hover)" }}
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
								gap={3}
								px={4}
								py={2.5}
								textAlign="left"
								fontSize="sm"
								color="var(--wl-text)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									toggleAutoSelectNew();
								}}
							>
								<Text>Auto-select new requests</Text>
								<Box
									w={10}
									h={6}
									rounded="full"
									bg={autoSelectNew ? "var(--wl-accent)" : "var(--wl-bg-muted)"}
									position="relative"
									transition="background 0.2s"
									flexShrink={0}
									borderWidth="1px"
									borderColor={autoSelectNew ? "var(--wl-accent)" : "var(--wl-border-subtle)"}
								>
									<Box
										position="absolute"
										top={1}
										left={autoSelectNew ? 5 : 1}
										w={4}
										h={4}
										rounded="full"
										bg="white"
										transition="left 0.2s"
										shadow="sm"
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
