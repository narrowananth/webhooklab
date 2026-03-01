/**
 * Zustand store for WebhookLab inspect page UI state.
 * Manages all local UI state not tied to server data:
 * - Theme (dark/light mode)
 * - Selected request for detail pane
 * - Filter values (method, IP, request ID)
 * - Active tab in detail pane (Pretty, Raw, Headers, Query)
 * - Pause state for real-time capture
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WebhookEvent } from "../types";

export type DetailTab = "pretty" | "raw" | "headers" | "query";

export type ThemeMode = "light" | "dark";

interface InspectState {
	// Theme - persisted to localStorage
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	toggleTheme: () => void;

	// Selected request in the list - shows in right detail pane
	selectedEvent: WebhookEvent | null;
	setSelectedEvent: (event: WebhookEvent | null) => void;

	// Filter values for the requests list
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

	// Active tab in the right detail pane
	activeDetailTab: DetailTab;
	setActiveDetailTab: (tab: DetailTab) => void;

	// Pause real-time capture - when true, don't add new WebSocket events to list
	isPaused: boolean;
	setIsPaused: (paused: boolean) => void;
	togglePaused: () => void;

	// Auto-select newest request when it arrives (persisted)
	autoSelectNew: boolean;
	setAutoSelectNew: (v: boolean) => void;
	toggleAutoSelectNew: () => void;

	// Reset filters and selection (e.g. for "Clear" button)
	resetFilters: () => void;

	// Pagination page size (25, 50, 75, 100)
	pageSize: number;
	setPageSize: (n: number) => void;

	// Mobile: sidebar open/closed (filters drawer)
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;

	// Mobile bottom nav: requests | endpoints | metrics | settings
	activeNav: "requests" | "endpoints" | "metrics" | "settings";
	setActiveNav: (nav: "requests" | "endpoints" | "metrics" | "settings") => void;
}

export const useInspectStore = create<InspectState>()(
	persist(
		(set) => ({
			theme: "light",
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

			selectedEvent: null,
			setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

			methodFilter: "",
			setMethodFilter: (methodFilter) => set({ methodFilter }),
			statusFilter: "2xx",
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
					statusFilter: "2xx",
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
		}),
		{
			name: "webhooklab-inspect",
			partialize: (s) => ({ theme: s.theme, autoSelectNew: s.autoSelectNew }),
		},
	),
);
