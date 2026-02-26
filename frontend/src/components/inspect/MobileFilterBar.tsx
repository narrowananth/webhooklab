/**
 * Mobile filter bar: horizontal Method, IP Address, Request ID buttons.
 * Shown on mobile/tablet, hidden on desktop (filters in sidebar).
 */
import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { useState } from "react";
import { METHOD_COLORS } from "../../constants";
import { useInspectStore } from "../../store/useInspectStore";

const METHODS = ["All", "GET", "POST", "PUT", "DELETE"];

export function MobileFilterBar() {
	const [showIp, setShowIp] = useState(false);
	const [showId, setShowId] = useState(false);
	const {
		methodFilter,
		setMethodFilter,
		ipFilter,
		setIpFilter,
		requestIdFilter,
		setRequestIdFilter,
	} = useInspectStore();

	return (
		<Box
			px={4}
			py={3}
			bg="var(--wl-bg-subtle)"
			borderBottomWidth="1px"
			borderColor="var(--wl-border-subtle)"
			display={{ base: "block", lg: "none" }}
		>
			<Flex gap={2} flexWrap="wrap" mb={2}>
				{METHODS.map((m) => (
					<Button
						key={m}
						size="sm"
						variant={methodFilter === m || (m === "All" && !methodFilter) ? "solid" : "outline"}
						colorPalette={m === "All" ? "gray" : METHOD_COLORS[m] ?? "gray"}
						onClick={() => setMethodFilter(m === "All" ? "" : m)}
					>
						{m} ▼
					</Button>
				))}
			</Flex>
			<Flex gap={2} flexWrap="wrap">
				<Button
					size="sm"
					variant={showIp ? "solid" : "outline"}
					onClick={() => setShowIp(!showIp)}
				>
					IP Address
				</Button>
				<Button
					size="sm"
					variant={showId ? "solid" : "outline"}
					onClick={() => setShowId(!showId)}
				>
					Request ID
				</Button>
			</Flex>
			{(showIp || showId) && (
				<Flex gap={2} mt={2}>
					{showIp && (
						<Input
							placeholder="e.g. 192.168.1.1"
							value={ipFilter}
							onChange={(e) => setIpFilter(e.target.value)}
							size="sm"
							flex={1}
						/>
					)}
					{showId && (
						<Input
							placeholder="e.g. #42"
							value={requestIdFilter}
							onChange={(e) => setRequestIdFilter(e.target.value)}
							size="sm"
							flex={1}
						/>
					)}
				</Flex>
			)}
		</Box>
	);
}
