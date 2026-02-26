/**
 * WebhookLab Backend - Webhook inspection platform
 */
import { createServer } from "node:http";
import { app } from "./api/server.js";
import { config } from "./config.js";
import { closeDatabase, initDatabase } from "./db.js";
import { setupWebSocket } from "./websocket/server.js";

const server = createServer(app);
setupWebSocket(server);

async function main() {
	await initDatabase();

	server.listen(config.PORT, () => {
		console.log(`[WebhookLab] API listening on http://localhost:${config.PORT}`);
		console.log(`[WebhookLab] WebSocket: ws://localhost:${config.PORT}/ws?webhookId=<id>`);
	});
}

main().catch((err) => {
	console.error("[WebhookLab] Startup failed:", err);
	closeDatabase().finally(() => process.exit(1));
});

process.on("SIGINT", () => {
	closeDatabase().finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
	closeDatabase().finally(() => process.exit(0));
});
