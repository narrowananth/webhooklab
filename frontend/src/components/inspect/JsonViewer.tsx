/**
 * Body viewer for Pretty/Raw tabs. Supports JSON, GraphQL, XML, SOAP,
 * form-urlencoded, and raw text.
 */
import ReactJsonView from "@microlink/react-json-view";
import { Box, Text } from "@chakra-ui/react";
import { useInspectStore } from "../../store/useInspectStore";
import { highlightSearch } from "../../utils/highlightSearch";
import { getBodyFormat } from "../../utils/getBodyFormat";
import { formatXml } from "../../utils/formatXml";
import type { WebhookEvent } from "../../types";

interface JsonViewerProps {
	event: WebhookEvent;
	tab: "pretty" | "raw";
	searchFilter?: string;
}

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

function getDisplayContent(
	event: WebhookEvent,
	tab: "pretty" | "raw"
): { parsed: object | null; raw: string; format: ReturnType<typeof getBodyFormat> } {
	const raw = event.rawBody ?? (event.body ? JSON.stringify(event.body) : "");
	const format = getBodyFormat(event);

	if (tab === "raw") {
		return { parsed: null, raw: raw || "(empty)", format };
	}

	// Pretty tab
	switch (format.format) {
		case "json":
		case "graphql": {
			try {
				const parsed = event.body ?? (raw ? JSON.parse(raw) : {});
				return { parsed: parsed as object, raw: JSON.stringify(parsed, null, 2), format };
			} catch {
				return { parsed: null, raw: raw || "(empty)", format };
			}
		}
		case "xml":
		case "soap":
			return { parsed: null, raw: formatXml(raw), format };
		case "form-urlencoded": {
			const pairs = parseFormUrlEncoded(raw);
			const obj = Object.fromEntries(pairs.map((p) => [p.key, p.value]));
			return { parsed: obj as object, raw: JSON.stringify(obj, null, 2), format };
		}
		case "form-data":
		case "text":
		case "binary":
		case "unknown":
		default:
			return { parsed: null, raw: raw || "(empty)", format };
	}
}

export function JsonViewer({ event, tab, searchFilter }: JsonViewerProps) {
	const theme = useInspectStore((s) => s.theme);
	const isDark = theme === "dark";
	const { parsed, raw, format } = getDisplayContent(event, tab);

	// Raw tab: always plain text
	if (tab === "raw") {
		const content = highlightSearch(raw, searchFilter ?? "");
		return (
			<Box
				flex={1}
				overflow="auto"
				p="var(--wl-fluid-px)"
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

	// Pretty tab with JSON/GraphQL tree
	if (parsed && (format.format === "json" || format.format === "graphql" || format.format === "form-urlencoded")) {
		return (
			<Box
				flex={1}
				overflow="auto"
				p="var(--wl-fluid-px)"
				minH="200px"
				css={{
					"&::-webkit-scrollbar": { width: 6 },
					"& .variable-row, & *": { fontFamily: "var(--wl-font-mono) !important" },
				}}
			>
				<ReactJsonView
					src={parsed}
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

	// Pretty tab for XML, SOAP, text, etc. - formatted raw
	const content = highlightSearch(raw, searchFilter ?? "");
	return (
		<Box
			flex={1}
			overflow="auto"
			p="var(--wl-fluid-px)"
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
