import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/** TanStack Query client - handles API caching and background refetch */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
		},
	},
});

const rootEl = document.getElementById("root");
if (rootEl)
	createRoot(rootEl).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider value={defaultSystem}>
					<App />
				</ChakraProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
