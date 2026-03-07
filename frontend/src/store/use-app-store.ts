import { type ThemeMode, themeModeSchema } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	toggleTheme: () => void;
};

const defaultTheme: ThemeMode = "light";

function parseTheme(raw: unknown): ThemeMode {
	const parsed = themeModeSchema.safeParse(raw);
	return parsed.success ? parsed.data : defaultTheme;
}

export const useAppStore = create<AppState>()(
	persist(
		(set) => ({
			theme: defaultTheme,
			setTheme: (theme) => set({ theme }),
			toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
		}),
		{
			name: "webhooklab-app",
			partialize: (s) => ({ theme: s.theme }),
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					try {
						const parsed = JSON.parse(str) as { state?: { theme?: unknown } };
						const theme = parseTheme(parsed?.state?.theme);
						return { state: { theme } };
					} catch {
						return null;
					}
				},
				setItem: (name, value) => {
					localStorage.setItem(name, JSON.stringify(value));
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
