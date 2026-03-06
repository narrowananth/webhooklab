import { Box, Spinner } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";

function WebhookToInspectRedirect() {
	const { webhookId } = useParams<{ webhookId: string }>();
	return <Navigate to={webhookId ? `/inspect/${webhookId}` : "/"} replace />;
}

const AutoCreateWebhook = lazy(() => import("./pages/AutoCreateWebhook").then((m) => ({ default: m.AutoCreateWebhook })));
const Inspect = lazy(() => import("./pages/Inspect").then((m) => ({ default: m.Inspect })));
const CustomUrl = lazy(() => import("./pages/CustomUrl").then((m) => ({ default: m.CustomUrl })));
const ErrorPage = lazy(() => import("./pages/ErrorPage").then((m) => ({ default: m.ErrorPage })));
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
				<Suspense
					fallback={
						<Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="var(--wl-bg)">
							<Spinner size="xl" color="var(--wl-accent)" />
						</Box>
					}
				>
					<Routes>
					{/* Root: auto-create new webhook and redirect (handles refresh = new inbox) */}
					<Route path="/" element={<AutoCreateWebhook />} />
					{/* Inspect: load existing webhook data (bookmarkable URL) */}
					<Route
						path="/inspect/:webhookId"
						element={
							<ErrorBoundary title="Inspect crashed">
								<Inspect />
							</ErrorBoundary>
						}
					/>
					<Route path="/webhook/:webhookId" element={<WebhookToInspectRedirect />} />
					<Route path="/w/:slug" element={<CustomUrl />} />
					<Route path="/error" element={<ErrorPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</Suspense>
			</Box>
		</BrowserRouter>
	);
}

export default App;
