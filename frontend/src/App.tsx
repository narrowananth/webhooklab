import { Box } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Inspect } from "./pages/Inspect";
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
					<Route path="/" element={<Home />} />
					<Route path="/inspect/:webhookId" element={<Inspect />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Box>
		</BrowserRouter>
	);
}

export default App;
