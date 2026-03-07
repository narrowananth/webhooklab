import type { WebhookEvent } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type DetailTab = "pretty" | "raw" | "headers" | "query";
type ActiveNav = "requests" | "endpoints" | "metrics" | "settings";

type InspectState = {
	selectedEvent: WebhookEvent | null;
	setSelectedEvent: (event: WebhookEvent | null) => void;

	methodFilter: string;
	setMethodFilter: (v: string) => void;
	statusFilter: string;
	setStatusFilter: (v: string) => void;
	ipFilter: string;
	setIpFilter: (v: string) => void;
	requestIdFilter: string;
	setRequestIdFilter: (v: string) => void;
	searchFilter: string;
	setSearchFilter: (v: string) => void;

	activeDetailTab: DetailTab;
	setActiveDetailTab: (tab: DetailTab) => void;

	isPaused: boolean;
	setIsPaused: (paused: boolean) => void;
	togglePaused: () => void;

	autoSelectNew: boolean;
	setAutoSelectNew: (v: boolean) => void;
	toggleAutoSelectNew: () => void;

	resetFilters: () => void;

	pageSize: number;
	setPageSize: (n: number) => void;

	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;

	activeNav: ActiveNav;
	setActiveNav: (nav: ActiveNav) => void;

	wsEvents: WebhookEvent[];
	setWsEvents: (fn: (prev: WebhookEvent[]) => WebhookEvent[]) => void;
	wsConnected: boolean;
	setWsConnected: (v: boolean) => void;
	wsBytesReceived: number;
	setWsBytesReceived: (fn: (n: number) => number) => void;
};

export type { DetailTab, ActiveNav };

export const useInspectStore = create<InspectState>()(
	persist(
		(set) => ({
			selectedEvent: null,
			setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

			methodFilter: "",
			setMethodFilter: (methodFilter) => set({ methodFilter }),
			statusFilter: "All",
			setStatusFilter: (statusFilter) => set({ statusFilter }),
			ipFilter: "",
			setIpFilter: (ipFilter) => set({ ipFilter }),
			requestIdFilter: "",
			setRequestIdFilter: (requestIdFilter) => set({ requestIdFilter }),
			searchFilter: "",
			setSearchFilter: (searchFilter) => set({ searchFilter }),

			activeDetailTab: "pretty",
			setActiveDetailTab: (activeDetailTab) => set({ activeDetailTab }),

			isPaused: false,
			setIsPaused: (isPaused) => set({ isPaused }),
			togglePaused: () => set((s) => ({ isPaused: !s.isPaused })),

			autoSelectNew: true,
			setAutoSelectNew: (autoSelectNew) => set({ autoSelectNew }),
			toggleAutoSelectNew: () => set((s) => ({ autoSelectNew: !s.autoSelectNew })),

			resetFilters: () =>
				set({
					selectedEvent: null,
					methodFilter: "",
					statusFilter: "All",
					ipFilter: "",
					requestIdFilter: "",
					searchFilter: "",
				}),

			pageSize: 25,
			setPageSize: (pageSize) => set({ pageSize }),

			sidebarOpen: false,
			setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

			activeNav: "requests",
			setActiveNav: (activeNav) => set({ activeNav }),

			wsEvents: [],
			setWsEvents: (fn) => set((s) => ({ wsEvents: fn(s.wsEvents) })),
			wsConnected: false,
			setWsConnected: (wsConnected) => set({ wsConnected }),
			wsBytesReceived: 0,
			setWsBytesReceived: (fn) => set((s) => ({ wsBytesReceived: fn(s.wsBytesReceived) })),
		}),
		{
			name: "liveflares-inspect",
			partialize: (s) => ({ autoSelectNew: s.autoSelectNew }),
		},
	),
);
