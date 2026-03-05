import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const backendUrl = env.VITE_BACKEND_URL ?? "http://localhost:4000";
	const backendOrigin = backendUrl ? new URL(backendUrl).origin : backendUrl;
	const wsUrl = backendOrigin.replace(/^http/, "ws");

	return {
		plugins: [react(), tsconfigPaths()],
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom", "react-router-dom"],
						chakra: ["@chakra-ui/react", "@emotion/react"],
						query: ["@tanstack/react-query"],
					},
				},
			},
			chunkSizeWarningLimit: 600,
		},
		server: {
			port: env.VITE_PORT ? Number(env.VITE_PORT) : undefined,
			proxy: {
				"/health": { target: backendOrigin, changeOrigin: true },
				"/webhooks": { target: backendOrigin, changeOrigin: true },
				"/events": { target: backendOrigin, changeOrigin: true },
				"/ws": { target: wsUrl, ws: true },
				"/webhook": {
					target: backendOrigin,
					changeOrigin: true,
				},
			},
		},
	};
});
