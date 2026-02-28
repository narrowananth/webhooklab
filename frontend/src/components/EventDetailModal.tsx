import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	Input,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { replayEvent } from "../api";
import type { WebhookEvent } from "../types";

interface EventDetailModalProps {
	event: WebhookEvent | null;
	onClose: () => void;
	methodColors: Record<string, string>;
}

export function EventDetailModal({
	event,
	onClose,
	methodColors,
}: EventDetailModalProps) {
	const [targetUrl, setTargetUrl] = useState("");
	const [replayStatus, setReplayStatus] = useState<string | null>(null);
	const [replaying, setReplaying] = useState(false);
	const [activeTab, setActiveTab] = useState<"pretty" | "raw">("pretty");

	if (!event) return null;

	const bodyDisplay =
		event.rawBody ??
		(event.body ? JSON.stringify(event.body, null, 2) : "(empty)");

	async function handleReplay() {
		if (!targetUrl.trim()) return;
		setReplaying(true);
		setReplayStatus(null);
		try {
			const result = await replayEvent(event!.id, targetUrl.trim());
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

	const copyCurl = () => {
		const headers = Object.entries(event.headers ?? {})
			.map(([k, v]) => `-H '${k}: ${v}'`)
			.join(" ");
		const body = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
		const curl = `curl -X ${event.method} ${event.url} ${headers}${body ? ` -d '${body}'` : ""}`;
		navigator.clipboard.writeText(curl);
	};

	return (
		<Box
			position="fixed"
			inset={0}
			zIndex={50}
			display="flex"
			alignItems="center"
			justifyContent="center"
			bg="blackAlpha.700"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<Box
				bg="slate.900"
				borderWidth="1px"
				borderColor="slate.700"
				rounded="xl"
				maxW="4xl"
				w="full"
				maxH="90vh"
				mx={4}
				overflow="hidden"
				display="flex"
				flexDir="column"
				onClick={(e) => e.stopPropagation()}
			>
				<Flex
					align="center"
					justify="space-between"
					p={6}
					borderBottomWidth="1px"
					borderColor="slate.700"
				>
					<Flex align="center" gap={3}>
						<Badge
							colorPalette={methodColors[event.method] ?? "gray"}
							size="lg"
							fontFamily="mono"
						>
							{event.method}
						</Badge>
						<Heading size="lg">
							Event #{event.id} • {new Date(event.timestamp).toLocaleString()}
						</Heading>
					</Flex>
					<Button variant="ghost" size="sm" onClick={onClose}>
						✕
					</Button>
				</Flex>

				<Box flex={1} overflow="auto" p={6}>
					<Box mb={6}>
						<Text fontSize="xs" color="slate.500" mb={1}>
							URL
						</Text>
						<Text fontFamily="mono" fontSize="sm" wordBreak="break-all">
							{event.url}
						</Text>
					</Box>

					{Object.keys(event.headers ?? {}).length > 0 && (
						<Box mb={6}>
							<Text fontSize="xs" color="slate.500" mb={2}>
								Headers
							</Text>
							<Box
								bg="slate.900"
								p={4}
								rounded="lg"
								fontFamily="mono"
								fontSize="xs"
								overflow="auto"
							>
								{Object.entries(event.headers ?? {}).map(([k, v]) => (
									<Text key={k}>
										{k}: {v}
									</Text>
								))}
							</Box>
						</Box>
					)}

					<Box mb={6}>
						<Flex gap={2} mb={2}>
							<Button
								size="xs"
								variant={activeTab === "pretty" ? "solid" : "outline"}
								onClick={() => setActiveTab("pretty")}
							>
								Pretty
							</Button>
							<Button
								size="xs"
								variant={activeTab === "raw" ? "solid" : "outline"}
								onClick={() => setActiveTab("raw")}
							>
								Raw
							</Button>
							<Button size="xs" variant="outline" onClick={copyCurl}>
								Copy cURL
							</Button>
						</Flex>
						<Box
							bg="slate.900"
							p={4}
							rounded="lg"
							fontFamily="mono"
							fontSize="xs"
							overflow="auto"
							maxH="300px"
							whiteSpace="pre-wrap"
							wordBreak="break-all"
						>
							{activeTab === "pretty" && event.body
								? JSON.stringify(event.body, null, 2)
								: bodyDisplay}
						</Box>
					</Box>

					<Box>
						<Text fontSize="xs" color="slate.500" mb={2}>
							Replay to URL
						</Text>
						<Flex gap={2} align="center">
							<Input
								placeholder="https://example.com/callback"
								value={targetUrl}
								onChange={(e) => setTargetUrl(e.target.value)}
								bg="slate.800"
								borderColor="slate.600"
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
								color={replayStatus.startsWith("✓") ? "green.400" : "red.400"}
							>
								{replayStatus}
							</Text>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
