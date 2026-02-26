import { Box } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { CustomUrl } from "./pages/CustomUrl";
import { Inspect } from "./pages/Inspect";
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
					<Route path="/" element={<Landing />} />
					<Route path="/w/:slug" element={<CustomUrl />} />
					<Route path="/inspect/:webhookId" element={<Inspect />} />
					<Route path="/error" element={<ErrorPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Box>
		</BrowserRouter>
	);
}

export default App;
