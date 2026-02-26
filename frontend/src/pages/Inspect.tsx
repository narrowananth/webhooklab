/**
 * Inspect page: responsive layout for mobile and desktop.
 * Mobile: header, filter bar, activity list, empty state/detail, bottom nav.
 * Desktop: header, sidebar (filters), main content (list + detail), footer.
 *
 * TanStack Query + WebSocket for data. Zustand for UI state.
 */
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectHeader } from "../components/inspect/InspectHeader";
import { InspectSidebar } from "../components/inspect/InspectSidebar";
import { InspectMainContent } from "../components/inspect/InspectMainContent";
import { MobileFilterBar } from "../components/inspect/MobileFilterBar";
import { BottomNav } from "../components/inspect/BottomNav";
import { InspectFooter } from "../components/inspect/InspectFooter";
import { useWebhookQuery, useEventsQuery, useClearEventsMutation } from "../hooks/useWebhookQueries";
import { useWebSocket } from "../hooks/useWebSocket";
import { useInspectStore } from "../store/useInspectStore";

export function Inspect() {
	const { webhookId } = useParams<{ webhookId: string }>();
	const {
		setSelectedEvent,
		resetFilters,
		searchFilter,
		setSearchFilter,
		methodFilter,
		ipFilter,
		requestIdFilter,
	} = useInspectStore();

	const { data: webhook, isLoading: webhookLoading } = useWebhookQuery(webhookId ?? undefined);
	const { data: eventsData, isLoading: eventsLoading } = useEventsQuery(webhookId ?? undefined);
	const clearMutation = useClearEventsMutation(webhookId ?? undefined);
	const { events: wsEvents, setEvents, connected } = useWebSocket(webhookId ?? null);

	useEffect(() => {
		if (eventsData?.events) setEvents(eventsData.events);
	}, [eventsData?.events, setEvents]);

	const filteredEvents = useMemo(() => {
		return wsEvents.filter((e) => {
			if (searchFilter) {
				const q = searchFilter.toLowerCase();
				const bodyStr = e.rawBody ?? JSON.stringify(e.body ?? {});
				const match =
					e.method.toLowerCase().includes(q) ||
					bodyStr.toLowerCase().includes(q) ||
					JSON.stringify(e.headers ?? {}).toLowerCase().includes(q) ||
					JSON.stringify(e.queryParams ?? {}).toLowerCase().includes(q);
				if (!match) return false;
			}
			if (methodFilter && e.method !== methodFilter) return false;
			if (ipFilter && (!e.ip || !e.ip.includes(ipFilter))) return false;
			if (requestIdFilter) {
				const id = String(e.id);
				if (!id.includes(requestIdFilter.replace("#", ""))) return false;
			}
			return true;
		});
	}, [wsEvents, searchFilter, methodFilter, ipFilter, requestIdFilter]);

	const handleCopy = () => navigator.clipboard.writeText(webhook?.url ?? "");
	const handleClear = async () => {
		try {
			await clearMutation.mutateAsync();
			setSelectedEvent(null);
			resetFilters();
			setEvents([]);
		} catch {
			// ignore
		}
	};

	if (!webhookId) {
		return (
			<Box p={8} color="var(--wl-text)">
				<Text color="red.400">Missing webhook ID</Text>
			</Box>
		);
	}

	if (webhookLoading || (eventsLoading && !eventsData)) {
		return (
			<Box
				minH="100vh"
				bg="var(--wl-bg)"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Spinner size="xl" color="var(--wl-accent)" />
			</Box>
		);
	}

	return (
		<Box
			minH="100vh"
			display="flex"
			flexDir="column"
			bg="var(--wl-bg)"
			color="var(--wl-text)"
		>
			<InspectHeader
				connected={connected}
				onCopy={handleCopy}
				onClear={handleClear}
				searchValue={searchFilter}
				onSearchChange={setSearchFilter}
			/>

			<MobileFilterBar />

			<Box flex={1} display="flex" overflow="hidden">
				<InspectSidebar
					webhookUrl={webhook?.url ?? ""}
					events={wsEvents}
					onCopyUrl={handleCopy}
					hasSlug={!!webhook?.slug}
				/>
				<InspectMainContent
					events={filteredEvents}
					onSelectEvent={(e) => setSelectedEvent(e)}
					onCopy={handleCopy}
					onClear={handleClear}
				/>
			</Box>

			<InspectFooter connected={connected} />
			<BottomNav />
		</Box>
	);
}
