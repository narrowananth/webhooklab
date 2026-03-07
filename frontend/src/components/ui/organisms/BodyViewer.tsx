import { Box, Text } from "@/components/ui/atoms";
import { formatHtml } from "@/lib/formatHtml";
import { formatXml } from "@/lib/formatXml";
import type { BodyFormatInfo } from "@/lib/getBodyFormat";
import { highlightSearch } from "@/lib/highlightSearch";
import { parseMultipart } from "@/lib/parseMultipart";
import ReactJsonView from "@microlink/react-json-view";
import { z } from "zod";

const bodyFormatInfoSchema: z.ZodType<BodyFormatInfo> = z.object({
	format: z.enum([
		"json",
		"graphql",
		"xml",
		"soap",
		"html",
		"form-urlencoded",
		"form-data",
		"text",
		"binary",
		"unknown",
	]),
	contentType: z.string(),
	label: z.string(),
	extension: z.string(),
	mimeType: z.string(),
});

const bodyViewerPropsSchema = z.object({
	raw: z.string(),
	format: bodyFormatInfoSchema,
	tab: z.enum(["pretty", "raw"]),
	searchFilter: z.string().optional(),
	isDark: z.boolean().optional(),
	parsed: z.record(z.unknown()).nullable().optional(),
	contentTypeHeader: z.string().optional(),
});

export type BodyViewerProps = z.infer<typeof bodyViewerPropsSchema>;

const scrollBoxCss = { "&::-webkit-scrollbar": { width: 6 } };

function PreContent({ content, searchFilter }: { content: string; searchFilter?: string }) {
	const html = highlightSearch(content, searchFilter ?? "");
	return (
		<Text
			as="pre"
			fontSize="13px"
			lineHeight="1.6"
			fontFamily="var(--wl-font-mono)"
			whiteSpace="pre-wrap"
			wordBreak="break-all"
			color="var(--wl-text)"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes user content and only adds <mark> for highlights
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

export function BodyViewer({
	raw,
	format,
	tab,
	searchFilter,
	isDark = false,
	parsed,
	contentTypeHeader,
}: BodyViewerProps) {
	const displayRaw = raw || "(empty)";

	if (tab === "raw") {
		return (
			<Box flex={1} overflow="auto" p="var(--wl-fluid-px)" css={scrollBoxCss}>
				<PreContent content={displayRaw} searchFilter={searchFilter} />
			</Box>
		);
	}

	const useTree =
		(format.format === "json" ||
			format.format === "graphql" ||
			format.format === "form-urlencoded") &&
		((): object | null => {
			if (parsed !== undefined && parsed !== null && typeof parsed === "object")
				return parsed as object;
			if (format.format === "json" || format.format === "graphql") {
				try {
					const p = JSON.parse(displayRaw);
					return typeof p === "object" && p !== null ? p : null;
				} catch {
					return null;
				}
			}
			return null;
		})();

	if (useTree) {
		return (
			<Box
				flex={1}
				overflow="auto"
				p="var(--wl-fluid-px)"
				minH="100px"
				css={{
					...scrollBoxCss,
					"& .variable-row, & *": {
						fontFamily: "var(--wl-font-mono) !important",
					},
				}}
			>
				<ReactJsonView
					src={useTree}
					name={false}
					theme={isDark ? "monokai" : "rjv-default"}
					iconStyle="triangle"
					indentWidth={2}
					enableClipboard
					displayDataTypes={false}
					displayObjectSize
					displayArrayKey
					style={{
						background: "transparent",
						fontSize: 13,
						fontFamily: "var(--wl-font-mono)",
					}}
				/>
			</Box>
		);
	}

	if (format.format === "xml" || format.format === "soap") {
		const formatted = formatXml(displayRaw);
		return (
			<Box flex={1} overflow="auto" p="var(--wl-fluid-px)" css={scrollBoxCss}>
				<PreContent content={formatted} searchFilter={searchFilter} />
			</Box>
		);
	}

	if (format.format === "html") {
		let formatted = displayRaw;
		try {
			formatted = formatHtml(displayRaw);
		} catch {
			// keep raw on error
		}
		return (
			<Box flex={1} overflow="auto" p="var(--wl-fluid-px)" css={scrollBoxCss}>
				<PreContent content={formatted} searchFilter={searchFilter} />
			</Box>
		);
	}

	if (format.format === "form-data" && contentTypeHeader) {
		try {
			const parts = parseMultipart(displayRaw, contentTypeHeader);
			if (parts.length > 0) {
				return (
					<Box flex={1} overflow="auto" p="var(--wl-fluid-px)" css={scrollBoxCss}>
						<Box
							as="ul"
							listStyle="none"
							m={0}
							p={0}
							display="flex"
							flexDirection="column"
							gap={3}
						>
							{parts.map((part, i) => (
								<Box
									key={`${part.name}-${i}`}
									as="li"
									p={3}
									borderRadius="lg"
									borderWidth="1px"
									borderColor="var(--wl-border-subtle)"
									bg="var(--wl-bg-subtle)"
								>
									<Box
										display="flex"
										flexWrap="wrap"
										alignItems="center"
										gap={2}
										mb={2}
										fontSize="xs"
										color="var(--wl-text-subtle)"
									>
										<Text as="span" fontWeight={600}>
											{part.name}
										</Text>
										{part.filename != null && part.filename !== "" && (
											<Text as="span" fontFamily="var(--wl-font-mono)">
												file: {part.filename}
											</Text>
										)}
										{part.contentType != null && part.contentType !== "" && (
											<Text as="span">{part.contentType}</Text>
										)}
									</Box>
									<Text
										as="pre"
										fontSize="13px"
										lineHeight="1.5"
										fontFamily="var(--wl-font-mono)"
										whiteSpace="pre-wrap"
										wordBreak="break-all"
										color="var(--wl-text)"
										margin={0}
										// biome-ignore lint/security/noDangerouslySetInnerHtml: highlightSearch escapes user content and only adds <mark> for highlights
										dangerouslySetInnerHTML={{
											__html: highlightSearch(
												part.value.length > 500
													? `${part.value.slice(0, 500)}\n… (${part.value.length} chars total)`
													: part.value,
												searchFilter ?? "",
											),
										}}
									/>
								</Box>
							))}
						</Box>
					</Box>
				);
			}
		} catch {
			// fall through to raw
		}
	}

	return (
		<Box flex={1} overflow="auto" p="var(--wl-fluid-px)" css={scrollBoxCss}>
			{format.format === "binary" && displayRaw !== "(empty)" && (
				<Text as="p" fontSize="xs" color="var(--wl-text-subtle)" mb={2}>
					Binary content ({displayRaw.length} chars)
				</Text>
			)}
			<PreContent content={displayRaw} searchFilter={searchFilter} />
		</Box>
	);
}
