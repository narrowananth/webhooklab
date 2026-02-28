import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { requests, webhooks } from "../db/schema.js";
import { broadcastToWebhook } from "../websocket/server.js";

export async function captureWebhook(
	req: Request,
	res: Response,
	webhookId: string,
): Promise<void> {
	try {
		const [webhook] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.webhookId, webhookId))
			.limit(1);

		if (!webhook) {
			res.status(404).json({ error: "Webhook inbox not found" });
			return;
		}

		const headers: Record<string, string> = {};
		for (const [k, v] of Object.entries(req.headers)) {
			if (v && typeof v === "string") headers[k] = v;
			else if (Array.isArray(v)) headers[k] = v.join(", ");
		}

		let body: Record<string, unknown> | null = null;
		let rawBody: string | null = null;

		if (req.body !== undefined && req.body !== null) {
			if (Buffer.isBuffer(req.body)) {
				rawBody = req.body.toString("utf8");
				try {
					body = JSON.parse(rawBody) as Record<string, unknown>;
				} catch {
					body = null;
				}
			} else if (typeof req.body === "string") {
				rawBody = req.body;
				try {
					body = JSON.parse(rawBody) as Record<string, unknown>;
				} catch {
					body = null;
				}
			} else if (typeof req.body === "object") {
				body = req.body as Record<string, unknown>;
				rawBody = JSON.stringify(body);
			}
		}

		const fullUrl =
			req.protocol + "://" + req.get("host") + req.originalUrl;
		const queryParams: Record<string, string> = {};
		for (const [k, v] of Object.entries(req.query)) {
			queryParams[k] = typeof v === "string" ? v : String(v);
		}

		const [inserted] = await db
			.insert(requests)
			.values({
				webhookId,
				method: req.method,
				url: fullUrl,
				headers,
				queryParams,
				body,
				rawBody,
				ip: req.ip ?? req.socket.remoteAddress ?? null,
			})
			.returning();

		res.status(200).json({ received: true, id: inserted.id });

		broadcastToWebhook(webhookId, {
			type: "event:new",
			event: {
				id: inserted.id,
				method: inserted.method,
				url: inserted.url,
				headers: inserted.headers,
				queryParams: inserted.queryParams,
				body: inserted.body,
				rawBody: inserted.rawBody,
				ip: inserted.ip,
				timestamp: inserted.createdAt,
			},
		});
	} catch (err) {
		console.error("[capture] error:", err);
		res.status(500).json({ error: "Failed to capture webhook" });
	}
}
