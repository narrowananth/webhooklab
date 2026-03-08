import { Box, Button, IconButton, Stack, Text } from "@/components/ui/atoms";
import { MethodBadge } from "@/components/ui/molecules";
import { BodyViewer } from "@/components/ui/organisms/BodyViewer";
import {
	copyToClipboard,
	formatRelativeTime,
	formatSize,
	getBodyFormat,
	getEventTimestamp,
	getPathFromUrl,
	getRequestSizeBytes,
	highlightSearch,
	toAxios,
	toCurl,
	toJava,
	toNodeFetch,
} from "@/lib";
import { useAppStore } from "@/store/use-app-store";
import type { WebhookEvent } from "@/types";
import { useState } from "react";

function parseFormUrlEncoded(raw: string): Array<{ key: string; value: string }> {
	const pairs: Array<{ key: string; value: string }> = [];
	for (const pair of raw.split("&")) {
		const eq = pair.indexOf("=");
		if (eq >= 0) {
			pairs.push({
				key: decodeURIComponent(pair.slice(0, eq).replace(/\+/g, " ")),
				value: decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, " ")),
			});
		} else if (pair) {
			pairs.push({ key: pair, value: "" });
		}
	}
	return pairs;
}

export type DetailTab = "pretty" | "raw" | "headers" | "query";

export type InspectDetailPaneProps = {
	event: WebhookEvent | null;
	activeDetailTab: DetailTab;
	onTabChange: (tab: DetailTab) => void;
	searchFilter?: string;
};

const TABS: { id: DetailTab; label: string }[] = [
	{ id: "pretty", label: "Pretty" },
	{ id: "raw", label: "Raw" },
	{ id: "headers", label: "Headers" },
	{ id: "query", label: "Query" },
];

const COPY_AS_OPTIONS: { id: string; label: string; fn: (e: WebhookEvent) => string }[] = [
	{ id: "curl", label: "cURL", fn: toCurl },
	{ id: "fetch", label: "Node fetch", fn: toNodeFetch },
	{ id: "axios", label: "Axios", fn: toAxios },
	{ id: "java", label: "Java (OkHttp)", fn: toJava },
];

export function InspectDetailPane({
	event,
	activeDetailTab,
	onTabChange,
	searchFilter = "",
}: InspectDetailPaneProps) {
	const theme = useAppStore((s) => s.theme);
	const [copyAsOpen, setCopyAsOpen] = useState(false);
	const [copyAsCopied, setCopyAsCopied] = useState<string | null>(null);
	const [bodyCopied, setBodyCopied] = useState(false);
	const [shareCopied, setShareCopied] = useState(false);
	const [lastCopiedKey, setLastCopiedKey] = useState<string | null>(null);

	const copyToClipboardWithKey = async (text: string, key: string) => {
		try {
			await copyToClipboard(text);
			setLastCopiedKey(key);
			setTimeout(() => setLastCopiedKey(null), 2000);
		} catch {
			//
		}
	};

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

	const path = getPathFromUrl(event.url);
	const requestSizeBytes = getRequestSizeBytes(event);
	const format = getBodyFormat(event);
	const receivedAgo = formatRelativeTime(getEventTimestamp(event));
	const rawBody = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	const headerCount = Object.keys(event.headers ?? {}).length;
	const contentTypes = Object.entries(event.headers ?? {}).find(
		([k]) => k.toLowerCase() === "content-type",
	);
	const contentTypeValue = contentTypes?.[1] ?? "—";
	let prettyData: unknown = event.body;
	if (prettyData == null && rawBody) {
		try {
			prettyData = JSON.parse(rawBody);
		} catch {
			prettyData = rawBody;
		}
	}
	if (format.format === "form-urlencoded" && typeof rawBody === "string" && rawBody) {
		try {
			const pairs = parseFormUrlEncoded(rawBody);
			prettyData = Object.fromEntries(pairs.map((p) => [p.key, p.value]));
		} catch {
			//
		}
	}

	const handleDownload = () => {
		const blob = new Blob([rawBody], { type: format.mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `webhook-${event.id}.${format.extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(url), 100);
	};

	const handleCopyAs = async (opt: (typeof COPY_AS_OPTIONS)[0]) => {
		try {
			await copyToClipboard(opt.fn(event));
			setCopyAsCopied(opt.id);
			setTimeout(() => setCopyAsCopied(null), 2000);
			setCopyAsOpen(false);
		} catch {
			//
		}
	};

	const handleCopyBody = async () => {
		if (!rawBody) return;
		try {
			await copyToClipboard(rawBody);
			setBodyCopied(true);
			setTimeout(() => setBodyCopied(false), 2000);
		} catch {
			//
		}
	};

	const handleShare = async () => {
		const url = new URL(window.location.href);
		url.searchParams.set("req", String(event.id));
		try {
			await copyToClipboard(url.toString());
			setShareCopied(true);
			setTimeout(() => setShareCopied(false), 2000);
		} catch {
			//
		}
	};

	return (
		<Box
			flex={1}
			minH={0}
			display="flex"
			flexDirection="column"
			overflow="hidden"
			bg="var(--wl-bg)"
		>
			<Stack
				direction="row"
				h="48px"
				minH="48px"
				flexShrink={0}
				alignItems="center"
				justifyContent="space-between"
				px="var(--wl-fluid-px)"
				py="var(--wl-fluid-py)"
				borderBottomWidth="1px"
				borderColor="var(--wl-border)"
				bg="var(--wl-bg-subtle)"
				gap={3}
				flexWrap="nowrap"
			>
				<Stack direction="row" alignItems="center" gap={2} minW={0} flex={1}>
					<MethodBadge method={event.method} />
					<Text
						as="code"
						fontSize="sm"
						fontWeight="medium"
						fontFamily="var(--wl-font-mono)"
						color="var(--wl-text-muted)"
						className="truncate"
					>
						{path}
					</Text>
				</Stack>
				<Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
					<Box position="relative">
						<Button
							size="sm"
							variant="ghost"
							aria-label={copyAsCopied ? "Copied" : "Copy as"}
							aria-expanded={copyAsOpen}
							onClick={() => setCopyAsOpen(!copyAsOpen)}
							p={1.5}
							color="var(--wl-text-subtle)"
						>
							<span
								className="material-symbols-outlined"
								style={{
									fontSize: 16,
									color: copyAsCopied
										? "var(--wl-success)"
										: "var(--wl-text-subtle)",
								}}
							>
								{copyAsCopied ? "check" : "content_copy"}
							</span>
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
									borderColor="var(--wl-border)"
									borderRadius="lg"
									py={1}
									className="shadow-lg"
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
											_hover={{ bg: "var(--wl-bg-hover)" }}
											onClick={() => handleCopyAs(opt)}
										>
											{opt.label}
										</Box>
									))}
								</Box>
							</>
						)}
					</Box>
					<Box w="1px" h={4} bg="var(--wl-border)" mx={1} />
					<Button
						size="sm"
						variant="ghost"
						p={1.5}
						onClick={handleDownload}
						aria-label="Download"
						color="var(--wl-text-subtle)"
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 18, color: "var(--wl-text-subtle)" }}
						>
							download
						</span>
					</Button>
				</Stack>
			</Stack>

			<Stack
				direction="row"
				h="48px"
				minH="48px"
				px="var(--wl-fluid-px)"
				py="var(--wl-fluid-py)"
				gap={3}
				fontSize="xs"
				color="var(--wl-text-subtle)"
				bg="var(--wl-bg-subtle)"
				borderBottomWidth="1px"
				borderColor="var(--wl-border)"
				flexWrap="wrap"
				alignItems="center"
			>
				<Text as="span" fontFamily="var(--wl-font-mono)" fontWeight={600}>
					#{event.id}
				</Text>
				<Stack direction="row" alignItems="center" gap={1}>
					<span
						className="material-symbols-outlined"
						style={{ fontSize: 14, color: "var(--wl-text-subtle)" }}
					>
						public
					</span>
					<Text as="span">{event.ip ?? "—"}</Text>
				</Stack>
				<Stack direction="row" alignItems="center" gap={1}>
					<span
						className="material-symbols-outlined"
						style={{ fontSize: 14, color: "var(--wl-text-subtle)" }}
					>
						schedule
					</span>
					<Text as="span">{receivedAgo}</Text>
				</Stack>
				<Stack direction="row" alignItems="center" gap={1}>
					<span
						className="material-symbols-outlined"
						style={{ fontSize: 14, color: "var(--wl-text-subtle)" }}
					>
						data_object
					</span>
					<Text as="span">{formatSize(requestSizeBytes)}</Text>
				</Stack>
				<Text
					as="span"
					fontFamily="var(--wl-font-mono)"
					fontSize="var(--wl-fluid-font-xs)"
					className="truncate"
					title="Content-Type header"
					style={{ maxWidth: "min(200px, 40vw)" }}
				>
					{contentTypeValue}
				</Text>
			</Stack>

			<Stack
				direction="row"
				h="48px"
				minH="48px"
				px="var(--wl-fluid-px)"
				py="var(--wl-fluid-py)"
				gap={3}
				borderBottomWidth="1px"
				borderColor="var(--wl-border)"
				bg="var(--wl-bg-subtle)"
				flexWrap="wrap"
				alignItems="center"
			>
				{TABS.map((tab) => (
					<Box
						key={tab.id}
						as="button"
						py={1}
						fontSize="sm"
						fontWeight={500}
						borderBottomWidth="2px"
						borderBottomColor={
							activeDetailTab === tab.id ? "var(--wl-accent)" : "transparent"
						}
						color={
							activeDetailTab === tab.id
								? "var(--wl-accent)"
								: "var(--wl-text-subtle)"
						}
						onClick={() => onTabChange(tab.id)}
						flexShrink={0}
					>
						{tab.label}
						{tab.id === "headers" && headerCount > 0 && (
							<Box
								as="span"
								ml={1}
								px={1.5}
								py={0.5}
								fontSize="10px"
								borderRadius="full"
								bg="var(--wl-elevated)"
							>
								{headerCount}
							</Box>
						)}
					</Box>
				))}
				<Stack direction="row" ml="auto" gap={1} flexShrink={0} alignItems="center">
					<Button
						size="sm"
						variant="ghost"
						onClick={handleCopyBody}
						aria-label={bodyCopied ? "Copied" : "Copy body"}
						p={1.5}
						color="var(--wl-text-subtle)"
					>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: 16,
								color: bodyCopied ? "var(--wl-success)" : "var(--wl-text-subtle)",
							}}
						>
							{bodyCopied ? "check" : "content_copy"}
						</span>
					</Button>
					<Box w="1px" h={4} bg="var(--wl-border)" mx={1} />
					<Button
						size="sm"
						variant="ghost"
						onClick={handleShare}
						aria-label={shareCopied ? "Copied" : "Share"}
						p={1.5}
						color="var(--wl-text-subtle)"
					>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: 16,
								color: shareCopied ? "var(--wl-success)" : "var(--wl-text-subtle)",
							}}
						>
							{shareCopied ? "check" : "link"}
						</span>
					</Button>
				</Stack>
			</Stack>

			<Box flex={1} minH={0} overflow="auto" p="var(--wl-fluid-px)" bg="var(--wl-bg)">
				{(activeDetailTab === "pretty" || activeDetailTab === "raw") && (
					<BodyViewer
						raw={rawBody || "(empty)"}
						format={format}
						tab={activeDetailTab}
						searchFilter={searchFilter}
						isDark={theme === "dark"}
						parsed={
							(format.format === "json" ||
								format.format === "graphql" ||
								format.format === "form-urlencoded") &&
							typeof prettyData === "object" &&
							prettyData !== null
								? (prettyData as Record<string, unknown>)
								: undefined
						}
						contentTypeHeader={contentTypes?.[1]}
					/>
				)}
				{activeDetailTab === "headers" && (
					<Stack direction="column" gap={3}>
						{Object.keys(event.headers ?? {}).length === 0 ? (
							<Text color="var(--wl-text-subtle)">No headers</Text>
						) : (
							Object.entries(event.headers ?? {}).map(([k, v]) => (
								<Box
									key={k}
									p={3}
									borderRadius="lg"
									bg="var(--wl-bg-subtle)"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
								>
									<Text
										fontSize="xs"
										fontWeight={600}
										color="var(--wl-text-subtle)"
										textTransform="uppercase"
										mb={1}
										// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes HTML
										dangerouslySetInnerHTML={{
											__html: highlightSearch(k, searchFilter),
										}}
									/>
									<Stack
										direction="row"
										alignItems="flex-start"
										justifyContent="space-between"
										gap={2}
									>
										<Text
											fontSize="sm"
											fontFamily="var(--wl-font-mono)"
											wordBreak="break-all"
											flex={1}
											minW={0}
											// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes HTML
											dangerouslySetInnerHTML={{
												__html: highlightSearch(String(v), searchFilter),
											}}
										/>
										<IconButton
											aria-label={
												lastCopiedKey === `h-${k}` ? "Copied" : "Copy"
											}
											variant="ghost"
											size="sm"
											onClick={() =>
												copyToClipboardWithKey(String(v), `h-${k}`)
											}
											p={1}
											rounded="md"
											flexShrink={0}
											color={
												lastCopiedKey === `h-${k}`
													? "var(--wl-success)"
													: "var(--wl-text-subtle)"
											}
										>
											<Box
												as="span"
												className="material-symbols-outlined"
												style={{ fontSize: 16 }}
											>
												{lastCopiedKey === `h-${k}`
													? "check"
													: "content_copy"}
											</Box>
										</IconButton>
									</Stack>
								</Box>
							))
						)}
					</Stack>
				)}
				{activeDetailTab === "query" && (
					<Stack direction="column" gap={3}>
						{Object.keys(event.queryParams ?? {}).length === 0 ? (
							<Text color="var(--wl-text-subtle)">No query parameters</Text>
						) : (
							Object.entries(event.queryParams ?? {}).map(([k, v]) => (
								<Box
									key={k}
									p={3}
									borderRadius="lg"
									bg="var(--wl-bg-subtle)"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
								>
									<Text
										fontSize="xs"
										color="var(--wl-text-subtle)"
										textTransform="uppercase"
										mb={1}
										// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes HTML
										dangerouslySetInnerHTML={{
											__html: highlightSearch(k, searchFilter),
										}}
									/>
									<Stack
										direction="row"
										alignItems="flex-start"
										justifyContent="space-between"
										gap={2}
									>
										<Text
											fontSize="sm"
											fontFamily="var(--wl-font-mono)"
											wordBreak="break-all"
											flex={1}
											minW={0}
											// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes HTML
											dangerouslySetInnerHTML={{
												__html: highlightSearch(String(v), searchFilter),
											}}
										/>
										<IconButton
											aria-label={
												lastCopiedKey === `q-${k}` ? "Copied" : "Copy"
											}
											variant="ghost"
											size="sm"
											onClick={() =>
												copyToClipboardWithKey(String(v), `q-${k}`)
											}
											p={1}
											rounded="md"
											flexShrink={0}
											color={
												lastCopiedKey === `q-${k}`
													? "var(--wl-success)"
													: "var(--wl-text-subtle)"
											}
										>
											<Box
												as="span"
												className="material-symbols-outlined"
												style={{ fontSize: 16 }}
											>
												{lastCopiedKey === `q-${k}`
													? "check"
													: "content_copy"}
											</Box>
										</IconButton>
									</Stack>
								</Box>
							))
						)}
					</Stack>
				)}
			</Box>

			<Stack
				direction="row"
				minH="var(--wl-footer-bar-height)"
				flexShrink={0}
				alignItems="center"
				justifyContent="flex-end"
				px="var(--wl-fluid-px)"
				py={2}
				borderTopWidth="1px"
				borderColor="var(--wl-border-subtle)"
				bg="var(--wl-bg-subtle)"
				flexWrap="wrap"
				gap={2}
			>
				<Stack direction="row" gap={4} fontSize="xs" color="var(--wl-text-subtle)">
					<Stack direction="row" alignItems="center" gap={1} as="span">
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{ fontSize: 12, color: "var(--wl-text-subtle)" }}
						>
							data_object
						</Box>
						<Text as="span">Size: {formatSize(requestSizeBytes)}</Text>
					</Stack>
					<Text as="span">Format: {format.label}</Text>
					<Text as="span">Received: {receivedAgo}</Text>
				</Stack>
			</Stack>
		</Box>
	);
}
