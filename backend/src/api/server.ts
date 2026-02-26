import cors from "cors";
/**
 * WebhookLab API Server
 */
import type { Express } from "express";
import express from "express";
import { config } from "../config.js";
import healthRoutes from "./routes/health.js";

const app: Express = express();

app.use(
	cors({
		origin: config.FRONTEND_URL,
	}),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.text({ limit: "1mb" }));

app.use("/api/health", healthRoutes);

app.get("/health", (_req, res) => {
	res.json({ status: "ok", service: "webhooklab-backend" });
});

export { app };
