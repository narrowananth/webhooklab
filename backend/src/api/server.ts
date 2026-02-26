import cors from "cors";
/**
 * WebhookLab API Server
 */
import type { Express } from "express";
import express from "express";
import { config } from "../config.js";
import { captureWebhook } from "./capture.js";
import healthRoutes from "./routes/health.js";
import eventRoutes from "./routes/events.js";
import webhookRoutes from "./routes/webhooks.js";

const app: Express = express();

app.use(
	cors({
		origin: config.FRONTEND_URL,
	}),
);

// Webhook capture: must run before body parsers to get raw body
app.all(
	"/webhook/:webhookId",
	express.raw({ type: () => true, limit: "1mb" }),
	(req, res) => captureWebhook(req, res, req.params.webhookId),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.text({ limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/events", eventRoutes);

app.get("/health", (_req, res) => {
	res.json({ status: "ok", service: "webhooklab-backend" });
});

export { app };
