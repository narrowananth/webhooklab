import { useAppStore } from "@/store/use-app-store";
import { useEffect } from "react";

export function useThemeEffect(): void {
	const theme = useAppStore((s) => s.theme);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		document.documentElement.style.colorScheme = theme;
	}, [theme]);
}
