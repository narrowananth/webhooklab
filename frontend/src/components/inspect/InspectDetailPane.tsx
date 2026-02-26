/**
 * Right detail pane: tabs (Pretty, Raw, Headers, Query),
 * Share/Copy Body buttons, and the content for the selected request.
 * Includes Replay to URL at the bottom.
 *
 * Uses Zustand for: selectedEvent, activeDetailTab, setActiveDetailTab.
 */
import { Badge, Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { METHOD_COLORS } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";
import { replayEvent } from "../../api";

export function InspectDetailPane() {
	const [targetUrl, setTargetUrl] = useState("");
	const [replayStatus, setReplayStatus] = useState<string | null>(null);
	const [replaying, setReplaying] = useState(false);
	const { activeDetailTab, setActiveDetailTab, selectedEvent: event } =
		useInspectStore();

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

	const bodyDisplay =
		event.rawBody ?? (event.body ? JSON.stringify(event.body, null, 2) : "(empty)");
	const time = new Date(event.timestamp).toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const copyBody = () => {
		const text = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
		navigator.clipboard.writeText(text);
	};

	async function handleReplay() {
		if (!targetUrl.trim() || !event) return;
		setReplaying(true);
		setReplayStatus(null);
		try {
			const result = await replayEvent(event.id, targetUrl.trim());
			setReplayStatus(
				result.ok
					? `✓ ${result.status} ${result.statusText}`
					: `✗ ${result.status} ${result.statusText}`,
			);
		} catch (err) {
			setReplayStatus(`Error: ${err instanceof Error ? err.message : "Failed"}`);
		} finally {
			setReplaying(false);
		}
	}

	const tabs: { id: typeof activeDetailTab; label: string }[] = [
		{ id: "pretty", label: "Pretty" },
		{ id: "raw", label: "Raw" },
		{ id: "headers", label: "Headers" },
		{ id: "query", label: "Query" },
	];

	return (
		<Box flex={1} display="flex" flexDir="column" overflow="hidden" bg="var(--wl-bg)">
			{/* Tabs + Share / Copy Body */}
			<Flex
				align="center"
				justify="space-between"
				px={6}
				py={4}
				borderBottomWidth="1px"
				borderColor="var(--wl-border-subtle)"
				gap={4}
			>
				<Flex gap={1}>
					{tabs.map((tab) => (
						<Button
							key={tab.id}
							size="sm"
							variant={activeDetailTab === tab.id ? "solid" : "ghost"}
							onClick={() => setActiveDetailTab(tab.id)}
						>
							{tab.label}
						</Button>
					))}
				</Flex>
				<Flex gap={2}>
					<Button size="sm" variant="ghost">
						Share
					</Button>
					<Button size="sm" variant="outline" onClick={copyBody}>
						Copy Body
					</Button>
				</Flex>
			</Flex>

			{/* Request summary */}
			<Flex
				align="center"
				gap={4}
				px={6}
				py={3}
				bg="var(--wl-bg-subtle)"
				borderBottomWidth="1px"
				borderColor="var(--wl-border-subtle)"
			>
				<Badge
					colorPalette={METHOD_COLORS[event.method] ?? "gray"}
					size="sm"
					fontFamily="mono"
				>
					{event.method}
				</Badge>
				<Text fontSize="sm" fontFamily="mono" color="var(--wl-text-muted)">
					#{event.id}
				</Text>
				<Text fontSize="sm" fontFamily="mono" color="var(--wl-text-muted)">
					{event.ip ?? "—"}
				</Text>
				<Text fontSize="sm" fontFamily="mono" color="var(--wl-text-muted)">
					{time}
				</Text>
			</Flex>

			{/* Content */}
			<Box flex={1} overflow="auto" p={6}>
				{activeDetailTab === "pretty" && (
					<Box
						fontFamily="mono"
						fontSize="sm"
						whiteSpace="pre-wrap"
						wordBreak="break-all"
						color="var(--wl-text)"
					>
						{event.body
							? JSON.stringify(event.body, null, 2)
							: bodyDisplay}
					</Box>
				)}
				{activeDetailTab === "raw" && (
					<Box
						fontFamily="mono"
						fontSize="sm"
						whiteSpace="pre-wrap"
						wordBreak="break-all"
						color="var(--wl-text)"
					>
						{bodyDisplay}
					</Box>
				)}
				{activeDetailTab === "headers" && (
					<Box
						as="table"
						w="full"
						fontSize="sm"
						style={{
							borderCollapse: "collapse",
						}}
					>
						<thead>
							<tr>
								<th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--wl-border-subtle)", color: "var(--wl-accent)" }}>
									KEY
								</th>
								<th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--wl-border-subtle)", color: "var(--wl-text-muted)" }}>
									VALUE
								</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(event.headers ?? {}).map(([k, v]) => (
								<tr key={k}>
									<td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--wl-border-subtle)", fontFamily: "monospace", color: "var(--wl-accent)" }}>
										{k}
									</td>
									<td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--wl-border-subtle)", fontFamily: "monospace", wordBreak: "break-all" }}>
										{v}
									</td>
								</tr>
							))}
						</tbody>
					</Box>
				)}
				{activeDetailTab === "query" && (
					<Box
						as="table"
						w="full"
						fontSize="sm"
						style={{ borderCollapse: "collapse" }}
					>
						<thead>
							<tr>
								<th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--wl-border-subtle)", color: "var(--wl-accent)" }}>
									KEY
								</th>
								<th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--wl-border-subtle)", color: "var(--wl-text-muted)" }}>
									VALUE
								</th>
							</tr>
						</thead>
						<tbody>
							{Object.keys(event.queryParams ?? {}).length === 0 ? (
								<tr>
									<td colSpan={2} style={{ color: "var(--wl-text-subtle)", padding: "0.5rem 0.75rem" }}>
										No query parameters
									</td>
								</tr>
							) : (
								Object.entries(event.queryParams ?? {}).map(([k, v]) => (
									<tr key={k}>
										<td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--wl-border-subtle)", fontFamily: "monospace", color: "var(--wl-accent)" }}>
											{k}
										</td>
										<td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--wl-border-subtle)", fontFamily: "monospace", wordBreak: "break-all" }}>
											{v}
										</td>
									</tr>
								))
							)}
						</tbody>
					</Box>
				)}
				{/* Replay section */}
				<Box mt={8} pt={6} borderTopWidth="1px" borderColor="var(--wl-border-subtle)">
					<Text fontSize="xs" color="var(--wl-text-muted)" mb={2}>
						Replay to URL
					</Text>
					<Flex gap={2} align="center">
						<Input
							placeholder="https://example.com/callback"
							value={targetUrl}
							onChange={(e) => setTargetUrl(e.target.value)}
							bg="var(--wl-bg-subtle)"
							borderColor="var(--wl-border)"
							fontFamily="mono"
							flex={1}
						/>
						<Button
							colorPalette="cyan"
							onClick={handleReplay}
							loading={replaying}
							disabled={!targetUrl.trim()}
						>
							Replay
						</Button>
					</Flex>
					{replayStatus && (
						<Text
							mt={2}
							fontSize="sm"
							color={replayStatus.startsWith("✓") ? "green.500" : "red.500"}
						>
							{replayStatus}
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
