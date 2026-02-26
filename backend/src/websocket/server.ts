import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server): WebSocketServer {
	const wss = new WebSocketServer({ server, path: "/ws" });

	wss.on("connection", (ws, req) => {
		const url = new URL(req.url ?? "", `http://${req.headers.host}`);
		const webhookId = url.searchParams.get("webhookId");

		if (!webhookId) {
			ws.close(1008, "Missing webhookId");
			return;
		}

		if (!clients.has(webhookId)) {
			clients.set(webhookId, new Set());
		}
		clients.get(webhookId)?.add(ws);

		ws.on("close", () => {
			clients.get(webhookId)?.delete(ws);
			if (clients.get(webhookId)?.size === 0) {
				clients.delete(webhookId);
			}
		});
	});

	return wss;
}

export function broadcastToWebhook(webhookId: string, data: object): void {
	const payload = JSON.stringify(data);
	for (const ws of clients.get(webhookId) ?? []) {
		if (ws.readyState === 1) ws.send(payload);
	}
}
