import { Box } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AutoCreateWebhook } from "./pages/AutoCreateWebhook";
import { Inspect } from "./pages/Inspect";
import { CustomUrl } from "./pages/CustomUrl";
import { ErrorPage } from "./pages/ErrorPage";
import { useThemeEffect } from "./hooks/useThemeEffect";

/** Applies theme from Zustand to document on mount and when theme changes */
function ThemeSync() {
	useThemeEffect();
	return null;
}

function App() {
	return (
		<BrowserRouter>
			<ThemeSync />
			<Box minH="100vh" bg="var(--wl-bg)" color="var(--wl-text)">
				<Routes>
					{/* Root: auto-create new webhook and redirect (handles refresh = new inbox) */}
					<Route path="/" element={<AutoCreateWebhook />} />
					{/* Inspect: load existing webhook data (bookmarkable URL) */}
					<Route path="/inspect/:webhookId" element={<Inspect />} />
					<Route path="/webhook/:webhookId" element={<Inspect />} />
					<Route path="/w/:slug" element={<CustomUrl />} />
					<Route path="/error" element={<ErrorPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Box>
		</BrowserRouter>
	);
}

export default App;
