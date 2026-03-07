import { Box, Button, IconButton, Text } from "@/components/ui/atoms";
import { truncateUrlEnd } from "@/lib/truncateUrl";
import { useInspectStore } from "@/store/use-inspect-store";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type TopNavProps = {
	webhookUrl: string;
	onCopy: () => void;
	onClear: () => void;
	isPaused: boolean;
	onTogglePause: () => void;
	theme: "light" | "dark";
	onToggleTheme: () => void;
	autoSelectNew: boolean;
	onToggleAutoSelectNew: () => void;
	sidebarOpen: boolean;
	onSidebarToggle: () => void;
	hasSelection: boolean;
};

const URL_CHAR_PX = 7.8;
const URL_PADDING_PX = 52;

export function TopNav({
	webhookUrl,
	onCopy,
	onClear,
	isPaused,
	onTogglePause,
	theme,
	onToggleTheme,
	autoSelectNew,
	onToggleAutoSelectNew,
	sidebarOpen,
	onSidebarToggle,
	hasSelection,
}: TopNavProps) {
	const wsConnected = useInspectStore((s) => s.wsConnected);
	const connected = wsConnected && !isPaused;
	const [urlCopied, setUrlCopied] = useState(false);
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

	const handleCopy = async () => {
		try {
			await onCopy();
			setUrlCopied(true);
			setTimeout(() => setUrlCopied(false), 2000);
		} catch {
			//
		}
	};

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
			<Box
				display="flex"
				alignItems="center"
				flexShrink={0}
				w={{ base: "auto", md: "var(--wl-sidebar-width)" }}
				minW={{ base: 0, md: "var(--wl-sidebar-min-width)" }}
				maxW={{ md: "var(--wl-sidebar-max-width)" }}
				h={10}
				gap={2}
			>
				<IconButton
					aria-label={sidebarOpen ? "Close request list" : "Open request list"}
					variant="ghost"
					size="md"
					display={{ base: hasSelection ? "flex" : "none", md: "none" }}
					w={9}
					h={9}
					rounded="lg"
					bg="var(--wl-bg)"
					borderWidth="1px"
					borderColor="var(--wl-border-subtle)"
					color="var(--wl-text-subtle)"
					_hover={{ bg: "var(--wl-bg-hover)", borderColor: "var(--wl-border)" }}
					onClick={onSidebarToggle}
					className="flex items-center justify-center"
				>
					<Box
						as="span"
						className="material-symbols-outlined"
						style={{ fontSize: "var(--wl-icon-xl)" }}
					>
						{sidebarOpen ? "chevron_left" : "menu"}
					</Box>
				</IconButton>
				<Link
					to="/"
					style={{
						fontWeight: 600,
						fontSize: "var(--wl-fluid-font-md)",
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
					<Text
						as="span"
						display={{ base: "none", sm: "inline" }}
						lineHeight="1"
						alignSelf="center"
					>
						WebhookLab
					</Text>
				</Link>
			</Box>

			<Box
				flex={1}
				minW={0}
				maxW="var(--wl-header-url-max)"
				px="var(--wl-fluid-sm)"
				display="flex"
				alignItems="center"
				h={10}
				justifyContent="center"
			>
				<Box
					ref={urlContainerRef}
					display="flex"
					alignItems="center"
					justifyContent="center"
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
					<IconButton
						aria-label={urlCopied ? "Copied" : "Copy URL"}
						variant="ghost"
						size="sm"
						onClick={handleCopy}
						p={2}
						h={9}
						minW={9}
						borderLeftWidth="1px"
						borderColor="var(--wl-border-subtle)"
						color={urlCopied ? "var(--wl-success)" : "var(--wl-text-subtle)"}
						_hover={{ bg: "var(--wl-bg-hover)" }}
						className="flex items-center justify-center flex-shrink-0"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: "var(--wl-icon-md)" }}
						>
							{urlCopied ? "check" : "content_copy"}
						</Box>
					</IconButton>
				</Box>
			</Box>

			<Box display="flex" alignItems="center" gap={1} flexShrink={0} minW={0} flex="0 1 auto">
				<Box
					display="flex"
					alignItems="center"
					gap={{ base: 1, sm: "var(--wl-fluid-sm)" }}
					flex="0 1 auto"
					minW={0}
					minH={10}
					py={1}
					overflowX="auto"
					overflowY="hidden"
					flexWrap="nowrap"
					className="scrollbar-hide"
				>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						gap={2}
						px={{ base: 2, sm: 3 }}
						py={1.5}
						rounded="full"
						bg={connected ? "var(--wl-connected-bg)" : "var(--wl-disconnected-bg)"}
						borderWidth={0}
						flexShrink={0}
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
							color={
								connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)"
							}
							textTransform="uppercase"
							letterSpacing="0.05em"
							alignSelf="center"
							display={{ base: "none", sm: "block" }}
						>
							{connected ? "Connected" : "Disconnected"}
						</Text>
						<Text
							fontSize="11px"
							fontWeight={600}
							lineHeight="1"
							color={
								connected ? "var(--wl-connected-fg)" : "var(--wl-disconnected-fg)"
							}
							alignSelf="center"
							display={{ base: "block", sm: "none" }}
						>
							{connected ? "ON" : "OFF"}
						</Text>
					</Box>
					<IconButton
						aria-label={isPaused ? "Resume" : "Pause"}
						variant="ghost"
						size="md"
						onClick={onTogglePause}
						w={9}
						h={9}
						rounded="lg"
						bg={isPaused ? "var(--wl-bg-subtle)" : "var(--wl-bg)"}
						color={isPaused ? "var(--wl-text-subtle)" : "var(--wl-text)"}
						className="header-action-btn flex-shrink-0"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: "var(--wl-icon-xl)" }}
						>
							{isPaused ? "play_arrow" : "pause"}
						</Box>
					</IconButton>
					<IconButton
						aria-label="Clear"
						variant="ghost"
						size="md"
						onClick={onClear}
						w={9}
						h={9}
						rounded="lg"
						color="var(--wl-text-subtle)"
						className="header-action-btn flex-shrink-0"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: "var(--wl-icon-xl)" }}
						>
							delete_sweep
						</Box>
					</IconButton>
					<IconButton
						aria-label={
							theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
						}
						variant="ghost"
						size="md"
						onClick={onToggleTheme}
						w={9}
						h={9}
						rounded="lg"
						color="var(--wl-text-subtle)"
						className="header-action-btn flex-shrink-0"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: "var(--wl-icon-xl)" }}
						>
							{theme === "dark" ? "light_mode" : "dark_mode"}
						</Box>
					</IconButton>
				</Box>
				{/* 3-dot Options: outside scroll so dropdown is not clipped by overflow */}
				<Box position="relative" ref={optionsRef} flexShrink={0}>
					<IconButton
						aria-label="Options"
						aria-expanded={optionsOpen}
						variant="ghost"
						size="md"
						onClick={(e) => {
							e.stopPropagation();
							setOptionsOpen((v) => !v);
						}}
						w={9}
						h={9}
						rounded="lg"
						color="var(--wl-text-subtle)"
						className="header-action-btn"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: "var(--wl-icon-xl)" }}
						>
							more_vert
						</Box>
					</IconButton>
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
							className="shadow-lg z-50"
						>
							<Button
								variant="ghost"
								size="sm"
								w="full"
								justifyContent="space-between"
								px={4}
								py={2.5}
								textAlign="left"
								color="var(--wl-text)"
								_hover={{ bg: "var(--wl-bg-hover)" }}
								onClick={(e) => {
									e.stopPropagation();
									onToggleAutoSelectNew();
								}}
								className="flex gap-3"
							>
								<Text as="span" fontSize="sm">
									Auto-select new requests
								</Text>
								<Box
									w={10}
									h={6}
									rounded="full"
									position="relative"
									borderWidth="1px"
									flexShrink={0}
									backgroundColor={
										autoSelectNew ? "var(--wl-accent)" : "var(--wl-bg-subtle)"
									}
									borderColor={
										autoSelectNew
											? "var(--wl-accent)"
											: "var(--wl-border-subtle)"
									}
								>
									<Box
										as="span"
										position="absolute"
										top={1}
										left={autoSelectNew ? 5 : 1}
										w={4}
										h={4}
										rounded="full"
										bg="white"
										shadow="sm"
										transition="left 0.2s"
									/>
								</Box>
							</Button>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
