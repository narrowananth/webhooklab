/**
 * Applies the theme from Zustand store to the document.
 * Sets data-theme attribute on html for CSS variable-based theming.
 */
import { useEffect } from "react";
import { useInspectStore } from "../store/useInspectStore";

export function useThemeEffect(): void {
	const theme = useInspectStore((s) => s.theme);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		document.documentElement.style.colorScheme = theme;
	}, [theme]);
}
