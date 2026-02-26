/**
 * Left sidebar: filters (HTTP method grid, IP, Request ID), personal URL.
 * Desktop: always visible. Mobile: drawer overlay, toggled by header button.
 */
import { Badge, Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WebhookEvent } from "../../types";
import { METHOD_COLORS } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";

const HTTP_METHODS = ["POST", "GET", "PUT", "DELETE"];

interface InspectSidebarProps {
	webhookUrl: string;
	events: WebhookEvent[];
	onCopyUrl: () => void;
	hasSlug?: boolean;
}

export function InspectSidebar({
	webhookUrl,
	events,
	onCopyUrl,
	hasSlug = false,
}: InspectSidebarProps) {
	const [customSlug, setCustomSlug] = useState("");
	const navigate = useNavigate();
	const {
		methodFilter,
		setMethodFilter,
		ipFilter,
		setIpFilter,
		requestIdFilter,
		setRequestIdFilter,
		sidebarOpen,
		setSidebarOpen,
	} = useInspectStore();

	const toggleMethod = (m: string) => {
		setMethodFilter(methodFilter === m ? "" : m);
	};

	// Truncate URL for display
	const displayUrl = webhookUrl.length > 24 ? webhookUrl.slice(0, 21) + "..." : webhookUrl;

	const sidebarContent = (
		<>
			{/* FILTERS section */}
			<Box px={4} py={4} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
				<Flex justify="space-between" align="center" mb={3}>
					<Text fontSize="xs" fontWeight="semibold" color="var(--wl-text-muted)">
						FILTERS
					</Text>
					<Button
						variant="ghost"
						size="xs"
						onClick={() => {
							setMethodFilter("");
							setIpFilter("");
							setRequestIdFilter("");
						}}
					>
						Clear all
					</Button>
				</Flex>

				{/* REQUESTS with count badge */}
				<Flex align="center" gap={2} mb={4}>
					<Text fontSize="sm" color="var(--wl-text-muted)">
						REQUESTS
					</Text>
					<Badge colorPalette="orange" size="sm">
						{events.length}
					</Badge>
				</Flex>

				{/* HTTP METHOD grid */}
				<Text fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
					HTTP METHOD
				</Text>
				<Flex gap={2} flexWrap="wrap" mb={4}>
					{HTTP_METHODS.map((m) => (
						<Button
							key={m}
							size="sm"
							variant={methodFilter === m ? "solid" : "outline"}
							colorPalette={METHOD_COLORS[m] ?? "gray"}
							onClick={() => toggleMethod(m)}
						>
							{m}
						</Button>
					))}
				</Flex>

				{/* IP ADDRESS */}
				<Text fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
					IP ADDRESS
				</Text>
				<Input
					placeholder="e.g. 192.168.1.1"
					value={ipFilter}
					onChange={(e) => setIpFilter(e.target.value)}
					bg="var(--wl-bg)"
					borderColor="var(--wl-border)"
					size="sm"
					mb={4}
				/>

				{/* REQUEST ID */}
				<Text fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
					REQUEST ID
				</Text>
				<Input
					placeholder="Search by ID..."
					value={requestIdFilter}
					onChange={(e) => setRequestIdFilter(e.target.value)}
					bg="var(--wl-bg)"
					borderColor="var(--wl-border)"
					size="sm"
				/>
			</Box>

			{/* YOUR PERSONAL URL */}
			<Box px={4} py={4} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
				<Text fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
					YOUR WEBHOOK URL
				</Text>
				<Flex align="center" gap={2}>
					<Text
						fontSize="sm"
						fontFamily="mono"
						color="var(--wl-accent)"
						truncate
						flex={1}
					>
						{displayUrl}
					</Text>
					<Button size="xs" variant="ghost" onClick={onCopyUrl} aria-label="Copy">
						📋
					</Button>
				</Flex>
				{/* Create custom URL - only if no slug yet */}
				{!hasSlug && (
					<Box mt={3}>
						<Text fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
							Custom URL (e.g. stripe-payments)
						</Text>
						<Flex gap={2}>
							<Input
								placeholder="my-webhook"
								value={customSlug}
								onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
								size="sm"
								bg="var(--wl-bg)"
								borderColor="var(--wl-border)"
							/>
							<Button
								size="sm"
								onClick={() => {
									const s = customSlug.trim().toLowerCase();
									if (s.length >= 3) navigate(`/w/${s}`);
								}}
								disabled={customSlug.trim().length < 3}
							>
								Go
							</Button>
						</Flex>
					</Box>
				)}
			</Box>
		</>
	);

	// Desktop: fixed sidebar
	return (
		<>
			{/* Desktop sidebar - hidden on mobile */}
			<Box
				w="280px"
				minW="280px"
				flexShrink={0}
				bg="var(--wl-bg-subtle)"
				borderRightWidth="1px"
				borderColor="var(--wl-border-subtle)"
				display={{ base: "none", lg: "block" }}
				overflow="auto"
			>
				{sidebarContent}
			</Box>

			{/* Mobile drawer overlay */}
			{sidebarOpen && (
				<>
					<Box
						position="fixed"
						inset={0}
						zIndex={40}
						bg="blackAlpha.600"
						onClick={() => setSidebarOpen(false)}
					/>
					<Box
						position="fixed"
						top={0}
						left={0}
						w="min(320px, 85vw)"
						h="full"
						zIndex={50}
						bg="var(--wl-bg-subtle)"
						overflow="auto"
						boxShadow="xl"
					>
						<Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="var(--wl-border-subtle)">
							<Text fontWeight="semibold">Filters</Text>
							<Button size="sm" variant="ghost" onClick={() => setSidebarOpen(false)}>
								✕
							</Button>
						</Flex>
						{sidebarContent}
					</Box>
				</>
			)}
		</>
	);
}
