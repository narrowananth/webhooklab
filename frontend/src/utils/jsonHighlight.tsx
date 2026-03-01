/**
 * Simple JSON syntax highlighting - renders pretty-printed JSON with colored spans.
 * Keys: accent, strings: green, numbers: orange, null/boolean: gray.
 */
import { Box, Flex, Text } from "@chakra-ui/react";

function findStringEnd(s: string, start: number): number {
	let j = start + 1;
	while (j < s.length) {
		if (s[j] === "\\") j += 2;
		else if (s[j] === '"') return j + 1;
		else j++;
	}
	return s.length;
}

/** Highlights a single line of JSON */
function highlightJsonLine(line: string) {
	const parts: { text: string; color: string }[] = [];
	let i = 0;
	const len = line.length;

	while (i < len) {
		// Key: "key" followed by :
		if (line[i] === '"') {
			const end = findStringEnd(line, i);
			const after = line.slice(end).match(/^\s*:/);
			if (after) {
				parts.push({ text: line.slice(i, end), color: "var(--wl-json-key)" });
				parts.push({ text: line.slice(end, end + after[0].length), color: "var(--wl-text)" });
				i = end + after[0].length;
				continue;
			}
			// String value
			parts.push({ text: line.slice(i, end), color: "green.500" });
			i = end;
			continue;
		}

		// Number
		const numMatch = line.slice(i).match(/^-?\d+\.?\d*([eE][+-]?\d+)?/);
		if (numMatch) {
			parts.push({ text: numMatch[0], color: "var(--wl-json-number)" });
			i += numMatch[0].length;
			continue;
		}

		// null
		if (line.slice(i, i + 4) === "null") {
			parts.push({ text: "null", color: "var(--wl-json-null)" });
			i += 4;
			continue;
		}
		// true
		if (line.slice(i, i + 4) === "true") {
			parts.push({ text: "true", color: "var(--wl-text-subtle)" });
			i += 4;
			continue;
		}
		// false
		if (line.slice(i, i + 5) === "false") {
			parts.push({ text: "false", color: "var(--wl-json-boolean)" });
			i += 5;
			continue;
		}

		parts.push({ text: line[i], color: "var(--wl-text)" });
		i++;
	}

	return parts;
}

/** Renders JSON with line numbers and syntax highlighting */
export function JsonPrettyView({ data }: { data: unknown }) {
	let formatted: string;
	try {
		formatted =
			typeof data === "string"
				? JSON.stringify(JSON.parse(data), null, 2)
				: JSON.stringify(data, null, 2);
	} catch {
		return (
			<Text fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap" color="var(--wl-text)">
				{String(data)}
			</Text>
		);
	}

	const lines = formatted.split("\n");
	return (
		<Box fontFamily="mono" fontSize="sm" lineHeight="relaxed">
			{lines.map((line, idx) => {
				const segments = highlightJsonLine(line);
				return (
					<Flex key={idx} gap={4} _hover={{ bg: "var(--wl-bg-hover)" }}>
						<Text
							as="span"
							w={8}
							flexShrink={0}
							textAlign="right"
							color="var(--wl-text-subtle)"
							userSelect="none"
						>
							{idx + 1}
						</Text>
						<Text as="span">
							{segments.map((seg, j) => (
								<Text key={j} as="span" color={seg.color}>
									{seg.text}
								</Text>
							))}
						</Text>
					</Flex>
				);
			})}
		</Box>
	);
}
