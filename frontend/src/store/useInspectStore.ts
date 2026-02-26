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

	// Reset filters and selection (e.g. for "Clear" button)
	resetFilters: () => void;

	// Mobile bottom nav - active tab
	activeNav: "requests" | "endpoints" | "metrics" | "settings";
	setActiveNav: (nav: "requests" | "endpoints" | "metrics" | "settings") => void;

	// Mobile: sidebar open/closed (filters drawer)
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export const useInspectStore = create<InspectState>()(
	persist(
		(set) => ({
			theme: "dark",
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

			selectedEvent: null,
			setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

			methodFilter: "",
			setMethodFilter: (methodFilter) => set({ methodFilter }),
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

			resetFilters: () =>
				set({
					selectedEvent: null,
					methodFilter: "",
					ipFilter: "",
					requestIdFilter: "",
					searchFilter: "",
				}),

			activeNav: "requests",
			setActiveNav: (activeNav) => set({ activeNav }),

			sidebarOpen: false,
			setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
		}),
		{
			name: "webhooklab-inspect",
			partialize: (s) => ({ theme: s.theme }),
		},
	),
);
