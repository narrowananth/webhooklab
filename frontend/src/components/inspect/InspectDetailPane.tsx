/**
 * Inspector detail pane: header bar (method, path, Copy-as/Download),
 * Pretty/Raw/Headers/Query tabs, Share/Copy Body, syntax-highlighted JSON, footer with meta.
 */
import { Badge, Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { METHOD_COLORS } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";
import { getPathFromUrl } from "../../utils/truncateUrl";
import { formatRelativeTime } from "../../utils/relativeTime";
import { highlightSearch } from "../../utils/highlightSearch";
import { toAxios, toCurl, toJava, toNodeFetch } from "../../utils/requestToCode";
import { JsonViewer } from "./JsonViewer";
import { formatSize, getRequestSizeBytes } from "../../utils/requestSize";
import type { WebhookEvent } from "../../types";

export function InspectDetailPane() {
	const { activeDetailTab, setActiveDetailTab, selectedEvent: event, searchFilter } =
		useInspectStore();
	const [shareCopied, setShareCopied] = useState(false);
	const [bodyCopied, setBodyCopied] = useState(false);
	const [copyAsOpen, setCopyAsOpen] = useState(false);
	const [copyAsCopied, setCopyAsCopied] = useState<string | null>(null);

	if (!event) {
		return (
			<Box
				flex={1}
				display="flex"
				alignItems="center"
				justifyContent="center"
				bg="var(--wl-bg)"
				color="var(--wl-text-subtle)"
			>
				<Text>Select a request to inspect</Text>
			</Box>
		);
	}

	const requestSizeBytes = getRequestSizeBytes(event);
	const headerCount = Object.keys(event.headers ?? {}).length;
	const path = getPathFromUrl(event.url);
	const receivedAgo = formatRelativeTime(event.timestamp);

	const handleDownload = () => {
		const text =
			event.rawBody ?? (event.body ? JSON.stringify(event.body, null, 2) : "{}");
		const blob = new Blob([text], { type: "application/json" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download =
			event.rawBody || event.body
				? `webhook-${event.id}.json`
				: `webhook-${event.id}-empty.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	const COPY_AS_OPTIONS: { id: string; label: string; fn: (e: WebhookEvent) => string }[] = [
		{ id: "curl", label: "cURL", fn: toCurl },
		{ id: "fetch", label: "Node fetch", fn: toNodeFetch },
		{ id: "axios", label: "Axios", fn: toAxios },
		{ id: "java", label: "Java (OkHttp)", fn: toJava },
	];

	const handleCopyAs = async (opt: (typeof COPY_AS_OPTIONS)[0]) => {
		const code = opt.fn(event);
		try {
			await navigator.clipboard.writeText(code);
			setCopyAsCopied(opt.id);
			setTimeout(() => setCopyAsCopied(null), 2000);
			setCopyAsOpen(false);
		} catch {
			window.navigator.clipboard?.writeText(code);
			setCopyAsCopied(opt.id);
			setTimeout(() => setCopyAsCopied(null), 2000);
			setCopyAsOpen(false);
		}
	};

	const handleShare = async () => {
		const url = new URL(window.location.href);
		url.searchParams.set("req", String(event.id));
		try {
			await navigator.clipboard.writeText(url.toString());
			setShareCopied(true);
			setTimeout(() => setShareCopied(false), 2000);
		} catch {
			// fallback
			window.navigator.clipboard?.writeText(url.toString());
			setShareCopied(true);
			setTimeout(() => setShareCopied(false), 2000);
		}
	};

	const handleCopyBody = async () => {
		const text = event.rawBody ?? (event.body ? JSON.stringify(event.body, null, 2) : "");
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			setBodyCopied(true);
			setTimeout(() => setBodyCopied(false), 2000);
		} catch {
			window.navigator.clipboard?.writeText(text);
			setBodyCopied(true);
			setTimeout(() => setBodyCopied(false), 2000);
		}
	};

	const tabs: { id: typeof activeDetailTab; label: string; badge?: number }[] = [
		{ id: "pretty", label: "Pretty" },
		{ id: "raw", label: "Raw" },
		{ id: "headers", label: "Headers", badge: headerCount },
		{ id: "query", label: "Query" },
	];

	return (
		<Box flex={1} display="flex" flexDir="column" overflow="hidden" bg="var(--wl-bg)">
			{/* Header: Method + Path, Forward, Download */}
			<Flex
				minH={14}
				shrink={0}
				align="center"
				justify="space-between"
				px={{ base: 4, md: 6 }}
				py={{ base: 3, md: 0 }}
				borderBottomWidth="1px"
				borderColor="var(--wl-border-subtle)"
				bg="var(--wl-bg-subtle)"
				gap={{ base: 2, md: 4 }}
				flexWrap="wrap"
			>
				<Flex align="center" gap={2} minW={0} flex={1} minH={10}>
					<Badge
						colorPalette={METHOD_COLORS[event.method] ?? "gray"}
						size="sm"
						fontFamily="mono"
						px={2}
						py={1}
						flexShrink={0}
					>
						{event.method}
					</Badge>
					<Text
						as="code"
						fontSize={{ base: "xs", md: "sm" }}
						fontWeight="medium"
						color="var(--wl-text-muted)"
						fontFamily="mono"
						truncate
					>
						{path}
					</Text>
				</Flex>
				<Flex align="center" gap={1} flexShrink={0} minH={10}>
					<Box position="relative">
						<Button
							size="sm"
							variant="ghost"
							aria-label="Copy"
							aria-expanded={copyAsOpen}
							aria-haspopup="true"
							gap={{ base: 0, md: 2 }}
							px={{ base: 2, md: 3 }}
							display={{ base: "none", lg: "flex" }}
							onClick={() => setCopyAsOpen(!copyAsOpen)}
						>
							<span className="material-symbols-outlined" style={{ fontSize: 18 }}>
								content_copy
							</span>
							{copyAsCopied ? "Copied!" : "Copy"}
						</Button>
						{copyAsOpen && (
							<>
								<Box
									position="fixed"
									inset={0}
									zIndex={10}
									onClick={() => setCopyAsOpen(false)}
								/>
								<Box
									position="absolute"
									top="100%"
									right={0}
									mt={1}
									zIndex={20}
									bg="var(--wl-bg-subtle)"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
									rounded="lg"
									py={1}
									shadow="lg"
									minW={140}
								>
									{COPY_AS_OPTIONS.map((opt) => (
										<Box
											key={opt.id}
											as="button"
											w="full"
											textAlign="left"
											px={3}
											py={2}
											fontSize="sm"
											_hover={{ bg: "var(--wl-bg-muted)" }}
											onClick={() => handleCopyAs(opt)}
										>
											{opt.label}
										</Box>
									))}
								</Box>
							</>
						)}
					</Box>
					<Box
						w="1px"
						h={4}
						bg="var(--wl-border-subtle)"
						mx={1}
						display={{ base: "none", md: "block" }}
					/>
					<Box
						as="button"
						p={1.5}
						rounded="md"
						_hover={{ bg: "var(--wl-bg-muted)" }}
						onClick={handleDownload}
						aria-label="Download"
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 20, color: "var(--wl-text-subtle)" }}
						>
							download
						</span>
					</Box>
				</Flex>
			</Flex>

			{/* Meta bar: #ID, IP, Time, Size, Content-Type */}
			<Flex
				px={{ base: 4, md: 6 }}
				py={2}
				gap={4}
				fontSize="xs"
				color="var(--wl-text-subtle)"
				bg="var(--wl-bg-subtle)"
				borderBottomWidth="1px"
				borderColor="var(--wl-border-subtle)"
				flexWrap="wrap"
			>
				<Text as="span" fontFamily="mono" fontWeight="semibold">
					#{event.id}
				</Text>
				<Flex align="center" gap={1}>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>
						public
					</span>
					{event.ip ?? "—"}
				</Flex>
				<Flex align="center" gap={1}>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>
						schedule
					</span>
					{formatRelativeTime(event.timestamp)}
				</Flex>
				<Flex align="center" gap={1}>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>
						data_object
					</span>
					{formatSize(requestSizeBytes)}
				</Flex>
				<Text as="span" fontFamily="mono" truncate maxW="200px">
					{Object.entries(event.headers ?? {}).find(
						([k]) => k.toLowerCase() === "content-type",
					)?.[1] ?? "—"}
				</Text>
			</Flex>

			{/* Tabs + Share/Copy Body */}
			<Flex
				px={{ base: 4, md: 6 }}
				gap={{ base: 6, md: 8 }}
				borderBottomWidth="1px"
				borderColor="var(--wl-border-subtle)"
				bg="var(--wl-bg-subtle)"
				overflowX="auto"
				align="center"
				css={{ "&::-webkit-scrollbar": { height: 4 } }}
			>
				{tabs.map((tab) => (
					<Box
						key={tab.id}
						as="button"
						py={3}
						fontSize="sm"
						fontWeight="medium"
						borderBottomWidth="2px"
						borderBottomColor={activeDetailTab === tab.id ? "var(--wl-accent)" : "transparent"}
						color={activeDetailTab === tab.id ? "var(--wl-accent)" : "var(--wl-text-subtle)"}
						_hover={{ color: activeDetailTab === tab.id ? "var(--wl-accent)" : "var(--wl-text)" }}
						onClick={() => setActiveDetailTab(tab.id)}
						flexShrink={0}
					>
						{tab.label}
						{tab.badge != null && (
							<Box
								as="span"
								ml={1}
								px={1.5}
								py={0.5}
								fontSize="10px"
								rounded="full"
								bg="var(--wl-bg-muted)"
							>
								{tab.badge}
							</Box>
						)}
					</Box>
				))}
				<Flex ml="auto" gap={1} flexShrink={0}>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleShare}
						aria-label="Share"
						px={2}
						py={1.5}
						fontSize="xs"
						color="var(--wl-text-subtle)"
						_hover={{ color: "var(--wl-text)" }}
					>
						<span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>
							link
						</span>
						{shareCopied ? "Copied!" : "Share"}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleCopyBody}
						aria-label="Copy body"
						px={2}
						py={1.5}
						fontSize="xs"
						color="var(--wl-text-subtle)"
						_hover={{ color: "var(--wl-text)" }}
					>
						<span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>
							content_copy
						</span>
						{bodyCopied ? "Copied!" : "Copy Body"}
					</Button>
				</Flex>
			</Flex>

			{/* Content */}
			<Box
				flex={1}
				display="flex"
				flexDir="column"
				minH={0}
				bg="var(--wl-bg)"
			>
				{(activeDetailTab === "pretty" || activeDetailTab === "raw") && (
					<Box flex={1} minH={0} overflow="hidden" display="flex" flexDir="column">
						<JsonViewer event={event} tab={activeDetailTab} searchFilter={searchFilter} />
					</Box>
				)}
				{activeDetailTab === "headers" && (
					<Box flex={1} overflow="auto" p={{ base: 4, md: 6 }} css={{ "&::-webkit-scrollbar": { width: 6 } }}>
					<Box>
						{Object.keys(event.headers ?? {}).length === 0 ? (
							<Text color="var(--wl-text-subtle)">No headers</Text>
						) : (
							<Flex flexDir="column" gap={3}>
								{Object.entries(event.headers ?? {}).map(([k, v]) => (
									<Box
										key={k}
										p={3}
										rounded="lg"
										bg="var(--wl-bg-subtle)"
										borderWidth="1px"
										borderColor="var(--wl-border-subtle)"
									>
										<Text
											fontSize="xs"
											color="var(--wl-text-subtle)"
											textTransform="uppercase"
											mb={1}
											dangerouslySetInnerHTML={{ __html: highlightSearch(k, searchFilter ?? "") }}
										/>
										<Flex align="flex-start" justify="space-between" gap={2}>
											<Text
												fontSize="sm"
												fontFamily="mono"
												wordBreak="break-all"
												flex={1}
												minW={0}
												dangerouslySetInnerHTML={{
													__html: highlightSearch(String(v), searchFilter ?? ""),
												}}
											/>
											<Box
												as="button"
												p={1}
												rounded="md"
												_hover={{ bg: "var(--wl-bg-muted)" }}
												onClick={() => navigator.clipboard.writeText(v)}
												aria-label="Copy"
												flexShrink={0}
											>
												<span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--wl-text-subtle)" }}>
													content_copy
												</span>
											</Box>
										</Flex>
									</Box>
								))}
							</Flex>
						)}
					</Box>
				</Box>
				)}
				{activeDetailTab === "query" && (
					<Box flex={1} overflow="auto" p={{ base: 4, md: 6 }} css={{ "&::-webkit-scrollbar": { width: 6 } }}>
					<Box>
						{Object.keys(event.queryParams ?? {}).length === 0 ? (
							<Text color="var(--wl-text-subtle)">No query parameters</Text>
						) : (
							<Flex flexDir="column" gap={3}>
								{Object.entries(event.queryParams ?? {}).map(([k, v]) => (
									<Box
										key={k}
										p={3}
										rounded="lg"
										bg="var(--wl-bg-subtle)"
										borderWidth="1px"
										borderColor="var(--wl-border-subtle)"
									>
										<Text
											fontSize="xs"
											color="var(--wl-text-subtle)"
											textTransform="uppercase"
											mb={1}
											dangerouslySetInnerHTML={{
												__html: highlightSearch(k, searchFilter ?? ""),
											}}
										/>
										<Flex align="flex-start" justify="space-between" gap={2}>
											<Text
												fontSize="sm"
												fontFamily="mono"
												wordBreak="break-all"
												flex={1}
												minW={0}
												dangerouslySetInnerHTML={{
													__html: highlightSearch(String(v), searchFilter ?? ""),
												}}
											/>
											<Box
												as="button"
												p={1}
												rounded="md"
												_hover={{ bg: "var(--wl-bg-muted)" }}
												onClick={() => navigator.clipboard.writeText(v)}
												aria-label="Copy"
												flexShrink={0}
											>
												<span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--wl-text-subtle)" }}>
													content_copy
												</span>
											</Box>
										</Flex>
									</Box>
								))}
							</Flex>
						)}
					</Box>
				</Box>
				)}
			</Box>

			{/* Footer: Size, Format, Received */}
			<Flex
				minH={10}
				shrink={0}
				align="center"
				justify="space-between"
				px={{ base: 4, md: 6 }}
				py={{ base: 3, md: 2 }}
				borderTopWidth="1px"
				borderColor="var(--wl-border-subtle)"
				bg="var(--wl-bg-subtle)"
				flexWrap="wrap"
				gap={2}
			>
				<Flex gap={{ base: 3, md: 4 }} fontSize="10px" fontWeight="semibold" color="var(--wl-text-subtle)" textTransform="uppercase" letterSpacing="wider">
					<Flex align="center" gap={1} as="span">
						<span className="material-symbols-outlined" style={{ fontSize: 12 }}>
							data_object
						</span>
						<Text as="span">Size: {formatSize(requestSizeBytes)}</Text>
					</Flex>
					<Text as="span">Format: JSON</Text>
					<Text as="span">Received: {receivedAgo}</Text>
				</Flex>
			</Flex>
		</Box>
	);
}
