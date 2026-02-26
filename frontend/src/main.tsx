import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (rootEl)
	createRoot(rootEl).render(
		<StrictMode>
			<ChakraProvider value={defaultSystem}>
				<App />
			</ChakraProvider>
		</StrictMode>,
	);
