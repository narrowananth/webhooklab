import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const backendUrl = env.VITE_BACKEND_URL ?? "http://localhost:4000";
	const wsUrl = backendUrl.replace(/^http/, "ws");

	return {
		plugins: [react(), tsconfigPaths()],
		server: {
			port: env.VITE_PORT ? Number(env.VITE_PORT) : undefined,
			proxy: {
				"/api": { target: backendUrl, changeOrigin: true },
				"/ws": { target: wsUrl, ws: true },
				"/webhook": {
					target: backendUrl,
					changeOrigin: true,
					bypass(req) {
						// GET /webhook/* → serve SPA (inspect UI); POST etc → proxy to backend (capture)
						if (req.method === "GET") return "/index.html";
					},
				},
			},
		},
	};
});
