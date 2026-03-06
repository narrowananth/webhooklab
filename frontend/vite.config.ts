import { defineConfig, loadEnv } from "vite";
import type { ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/** Suppress EPIPE/ECONNRESET/ETIMEDOUT on /ws client socket when browser closes or connection drops (e.g. HMR, backend restart). */
const WS_SOCKET_ERROR_CODES = new Set(["EPIPE", "ECONNRESET", "ETIMEDOUT"]);

function suppressWsProxySocketErrors(): import("vite").Plugin {
	return {
		name: "suppress-ws-proxy-socket-errors",
		configureServer(server: ViteDevServer) {
			server.httpServer?.on("upgrade", (req, socket) => {
				if (!req.url?.startsWith("/ws")) return;
				socket.on("error", (err: NodeJS.ErrnoException) => {
					if (err.code && WS_SOCKET_ERROR_CODES.has(err.code)) return;
					console.error("[vite] ws client socket error:", err);
				});
			});
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const backendUrl = env.VITE_BACKEND_URL ?? "http://localhost:4000";
	const backendOrigin = backendUrl ? new URL(backendUrl).origin : backendUrl;
	const wsUrl = backendOrigin.replace(/^http/, "ws");

	return {
		plugins: [react(), tsconfigPaths(), suppressWsProxySocketErrors()],
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
			host: true,
			port: env.VITE_PORT ? Number(env.VITE_PORT) : undefined,
			proxy: {
				"/health": { target: backendOrigin, changeOrigin: true },
				"/webhooks": { target: backendOrigin, changeOrigin: true },
				"/events": { target: backendOrigin, changeOrigin: true },
				"/ws": {
					target: wsUrl,
					ws: true,
					configure: (proxy) => {
						proxy.on("error", (err: NodeJS.ErrnoException) => {
							if (err.code && WS_SOCKET_ERROR_CODES.has(err.code)) return;
							console.error("[vite] ws proxy error:", err);
						});
						// Swallow errors on the outgoing (backend) socket so they don't bubble and get logged
						proxy.on("proxyReqWs", (proxyReq: { socket?: { on?: (e: string, fn: () => void) => void } }) => {
							proxyReq?.socket?.on?.("error", () => {});
						});
					},
				},
				"/webhook": {
					target: backendOrigin,
					changeOrigin: true,
				},
			},
		},
	};
});
