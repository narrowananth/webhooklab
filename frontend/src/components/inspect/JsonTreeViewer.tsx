/**
 * Collapsible JSON tree with syntax highlighting.
 * Renders objects/arrays with expand/collapse; keys, strings, numbers, booleans, null styled.
 */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";

const KEY_COLOR = "var(--wl-accent)";
const STRING_COLOR = "#22c55e";
const NUMBER_COLOR = "#f59e0b";
const BOOLEAN_COLOR = "#8b5cf6";
const NULL_COLOR = "var(--wl-text-subtle)";
const BRACE_COLOR = "var(--wl-text-muted)";

interface JsonNodeProps {
	data: unknown;
	depth?: number;
}

function JsonNode({ data, depth = 0 }: JsonNodeProps) {
	const [expanded, setExpanded] = useState(depth < 2);

	if (data === null) {
		return (
			<Text as="span" color={NULL_COLOR} fontFamily="mono" fontSize="sm">
				null
			</Text>
		);
	}
	if (typeof data === "boolean") {
		return (
			<Text as="span" color={BOOLEAN_COLOR} fontFamily="mono" fontSize="sm">
				{String(data)}
			</Text>
		);
	}
	if (typeof data === "number") {
		return (
			<Text as="span" color={NUMBER_COLOR} fontFamily="mono" fontSize="sm">
				{String(data)}
			</Text>
		);
	}
	if (typeof data === "string") {
		return (
			<Text as="span" color={STRING_COLOR} fontFamily="mono" fontSize="sm">
				"{data}"
			</Text>
		);
	}

	if (Array.isArray(data)) {
		const isEmpty = data.length === 0;
		return (
			<Box fontFamily="mono" fontSize="sm">
				<Flex
					as="button"
					align="center"
					gap={1}
					textAlign="left"
					w="fit-content"
					_hover={{ opacity: 0.9 }}
					onClick={() => setExpanded((e) => !e)}
				>
					<Text as="span" color={BRACE_COLOR} fontSize="xs" w="1em">
						{expanded ? "▼" : "▶"}
					</Text>
					<Text as="span" color={BRACE_COLOR}>[</Text>
					{!expanded && (
						<Text as="span" color="var(--wl-text-subtle)">
							{data.length} items
						</Text>
					)}
					{!expanded && <Text as="span" color={BRACE_COLOR}>]</Text>}
				</Flex>
				{expanded && (
					<Box pl={4} borderLeftWidth="1px" borderColor="var(--wl-border-subtle)" ml={2}>
						{isEmpty ? (
							<Text as="span" color="var(--wl-text-subtle)">
								(empty)
							</Text>
						) : (
							data.map((item, i) => (
								<Box key={i} py={0.5}>
									<JsonNode data={item} depth={depth + 1} />
								</Box>
							))
						)}
						<Text as="span" color={BRACE_COLOR}>]</Text>
					</Box>
				)}
			</Box>
		);
	}

	if (typeof data === "object" && data !== null) {
		const entries = Object.entries(data);
		const isEmpty = entries.length === 0;
		return (
			<Box fontFamily="mono" fontSize="sm">
				<Flex
					as="button"
					align="center"
					gap={1}
					textAlign="left"
					w="fit-content"
					_hover={{ opacity: 0.9 }}
					onClick={() => setExpanded((e) => !e)}
				>
					<Text as="span" color={BRACE_COLOR} fontSize="xs" w="1em">
						{expanded ? "▼" : "▶"}
					</Text>
					<Text as="span" color={BRACE_COLOR}>{"{"}</Text>
					{!expanded && (
						<Text as="span" color="var(--wl-text-subtle)">
							{entries.length} items
						</Text>
					)}
					{!expanded && <Text as="span" color={BRACE_COLOR}>{"}"}</Text>}
				</Flex>
				{expanded && (
					<Box pl={4} borderLeftWidth="1px" borderColor="var(--wl-border-subtle)" ml={2}>
						{isEmpty ? (
							<Text as="span" color="var(--wl-text-subtle)">
								(empty)
							</Text>
						) : (
							entries.map(([k, v]) => (
								<Flex key={k} gap={2} py={0.5} align="flex-start">
									<Text as="span" color={KEY_COLOR} flexShrink={0}>
										{k}:
									</Text>
									<JsonNode data={v} depth={depth + 1} />
								</Flex>
							))
						)}
						<Text as="span" color={BRACE_COLOR}>{"}"}</Text>
					</Box>
				)}
			</Box>
		);
	}

	return null;
}

interface JsonTreeViewerProps {
	data: Record<string, unknown> | null;
	rawFallback?: string;
}

export function JsonTreeViewer({ data, rawFallback }: JsonTreeViewerProps) {
	const parsed =
		(data !== null && typeof data === "object" ? data : null) ??
		(rawFallback ? (() => {
			try {
				const p = JSON.parse(rawFallback);
				return typeof p === "object" && p !== null ? p : null;
			} catch {
				return null;
			}
		})() : null);

	if (parsed !== null) {
		return (
			<Box fontFamily="mono" fontSize="sm">
				<JsonNode data={parsed} />
			</Box>
		);
	}
	if (rawFallback) {
		return (
			<Box
				fontFamily="mono"
				fontSize="sm"
				whiteSpace="pre-wrap"
				wordBreak="break-all"
				color="var(--wl-text)"
			>
				{rawFallback}
			</Box>
		);
	}
	return (
		<Text color="var(--wl-text-subtle)" fontFamily="mono" fontSize="sm">
			{"{ } 0 items"}
		</Text>
	);
}
