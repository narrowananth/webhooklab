/**
 * JSON viewer for Pretty/Raw tabs using @microlink/react-json-view.
 * Pretty: collapsible tree with syntax highlighting. Raw: plain text.
 */
import ReactJsonView from "@microlink/react-json-view";
import { Box, Text } from "@chakra-ui/react";
import { useInspectStore } from "../../store/useInspectStore";
import { highlightSearch } from "../../utils/highlightSearch";
import type { WebhookEvent } from "../../types";

interface JsonViewerProps {
	event: WebhookEvent;
	tab: "pretty" | "raw";
	searchFilter?: string;
}

function getDisplayContent(
	event: WebhookEvent,
	tab: "pretty" | "raw"
): { parsed: object | null; raw: string } {
	const raw = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	if (tab === "raw") {
		return { parsed: null, raw: raw || "(empty)" };
	}
	try {
		const parsed = event.body ?? (raw ? JSON.parse(raw) : {});
		return { parsed: parsed as object, raw: JSON.stringify(parsed, null, 2) };
	} catch {
		return { parsed: null, raw: raw || "(empty)" };
	}
}

export function JsonViewer({ event, tab, searchFilter }: JsonViewerProps) {
	const theme = useInspectStore((s) => s.theme);
	const isDark = theme === "dark";
	const { parsed, raw } = getDisplayContent(event, tab);

	if (tab === "raw") {
		const content = highlightSearch(raw, searchFilter ?? "");
		return (
			<Box
				flex={1}
				overflow="auto"
				p={{ base: 4, md: 6 }}
				css={{ "&::-webkit-scrollbar": { width: 6 } }}
			>
				<Text
					as="pre"
					fontSize="13px"
					lineHeight="1.6"
					fontFamily="var(--wl-font-mono)"
					whiteSpace="pre-wrap"
					wordBreak="break-all"
					color="var(--wl-text)"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</Box>
		);
	}

	return (
		<Box
			flex={1}
			overflow="auto"
			p={{ base: 4, md: 6 }}
			minH="200px"
			css={{
				"&::-webkit-scrollbar": { width: 6 },
				"& .variable-row, & *": { fontFamily: "var(--wl-font-mono) !important" },
			}}
		>
			<ReactJsonView
				src={parsed ?? {}}
				name={false}
				theme={isDark ? "monokai" : "rjv-default"}
				iconStyle="triangle"
				indentWidth={2}
				enableClipboard
				displayDataTypes={false}
				displayObjectSize
				displayArrayKey
				style={{ background: "transparent", fontSize: 13, fontFamily: "var(--wl-font-mono)" }}
			/>
		</Box>
	);
}
