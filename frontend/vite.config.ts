import http from "node:http";
import https from "node:https";
import type { UserConfig, ViteDevServer, Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const WS_SOCKET_ERROR_CODES = new Set([
	"EPIPE",
	"ECONNRESET",
	"ETIMEDOUT",
	"ECONNREFUSED",
]);

function wrapSocket(socket: import("node:net").Socket) {
	const rawEmit = socket.emit.bind(socket);
	socket.emit = function (event: string, ...args: unknown[]) {
		if (event === "error" && args[0]) {
			const err = args[0] as NodeJS.ErrnoException;
			if (err.code && WS_SOCKET_ERROR_CODES.has(err.code)) return false;
			if (err.errno === 32 || err.message?.includes?.("EPIPE")) return false;
		}
		return rawEmit(event, ...args);
	};
}

function suppressWsProxySocketErrors(): Plugin {
	return {
		name: "suppress-ws-proxy-socket-errors",
		configureServer(server: ViteDevServer) {
			server.httpServer?.prependListener("upgrade", (req, socket) => {
				if (!req.url?.startsWith("/ws")) return;
				wrapSocket(socket);
			});
		},
	};
}

export default defineConfig(({ mode }): UserConfig => {
	const env = loadEnv(mode, process.cwd(), "");

	const backendUrl = env.VITE_BACKEND_URL ?? "http://localhost:4000";
	const backendOrigin = backendUrl ? new URL(backendUrl).origin : backendUrl;
	const wsUrl = backendOrigin.replace(/^http/, "ws");
	const isHttps = backendOrigin.startsWith("https:");
	const proxyAgent = isHttps ? new https.Agent() : new http.Agent();

	function proxyEntry(target: string) {
		return {
			target,
			changeOrigin: true,
			...(isHttps && { secure: false, agent: proxyAgent }),
		};
	}

	return {
		plugins: [
			react(),
			tsconfigPaths(),
			suppressWsProxySocketErrors(),
		],

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
			allowedHosts: [
				"liveflares.com",
				"api.liveflares.com",
				"localhost",
				".localhost",
			],
			hmr: env.VITE_HMR_HOST
				? {
						host: env.VITE_HMR_HOST,
						protocol: (env.VITE_HMR_PROTOCOL as "ws" | "wss") ?? "wss",
					}
				: undefined,

			proxy: {
				"/health": proxyEntry(backendOrigin),

				"/webhooks": proxyEntry(backendOrigin),

				"/events": proxyEntry(backendOrigin),

				"/webhook": proxyEntry(backendOrigin),

				"/ws": {
					target: wsUrl,
					ws: true,
					agent: proxyAgent,

					configure: (proxy) => {
						proxy.on("error", (err: NodeJS.ErrnoException) => {
							if (err.code && WS_SOCKET_ERROR_CODES.has(err.code)) return;
							if (err.errno === 32 || err.message?.includes?.("EPIPE")) return;
							console.error("[vite] ws proxy error:", err);
						});

						(proxy as any).on("proxyReqWs", (proxyReq: any) => {
							proxyReq?.socket?.on?.("error", () => {});
						});
					},
				},
			},
		},
	};
});