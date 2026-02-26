import type { Router } from "express";
import { Router as createRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db.js";
import { requests, webhooks } from "../../db/schema.js";

const router: Router = createRouter();

// Replay must be defined before /:inboxId to avoid param collision
router.post("/:eventId/replay", async (req, res) => {
	try {
		const { eventId } = req.params;
		const { targetUrl } = req.body as { targetUrl?: string };

		if (!targetUrl || typeof targetUrl !== "string") {
			res.status(400).json({ error: "targetUrl is required" });
			return;
		}

		const id = Number(eventId);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "Invalid event ID" });
			return;
		}

		const [event] = await db
			.select()
			.from(requests)
			.where(eq(requests.id, id))
			.limit(1);

		if (!event) {
			res.status(404).json({ error: "Event not found" });
			return;
		}

		const headers: Record<string, string> = { ...(event.headers ?? {}) };
		if (!headers["content-type"] && event.body) {
			headers["content-type"] = "application/json";
		}

		const body =
			event.rawBody ?? (event.body ? JSON.stringify(event.body) : undefined);

		const response = await fetch(targetUrl, {
			method: event.method,
			headers,
			body,
		});

		res.json({
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
		});
	} catch (err) {
		console.error("[replay] error:", err);
		res.status(500).json({ error: "Replay failed" });
	}
});

// Clear all events for an inbox
router.delete("/:inboxId", async (req, res) => {
	try {
		const { inboxId } = req.params;
		const [webhook] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.webhookId, inboxId))
			.limit(1);

		if (!webhook) {
			res.status(404).json({ error: "Webhook inbox not found" });
			return;
		}

		await db.delete(requests).where(eq(requests.webhookId, inboxId));
		res.json({ cleared: true });
	} catch (err) {
		console.error("[events] clear error:", err);
		res.status(500).json({ error: "Failed to clear events" });
	}
});

router.get("/:inboxId", async (req, res) => {
	try {
		const { inboxId } = req.params;
		const page = Math.max(1, Number(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
		const offset = (page - 1) * limit;

		const [webhook] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.webhookId, inboxId))
			.limit(1);

		if (!webhook) {
			res.status(404).json({ error: "Webhook inbox not found" });
			return;
		}

		const events = await db
			.select()
			.from(requests)
			.where(eq(requests.webhookId, inboxId))
			.orderBy(desc(requests.createdAt))
			.limit(limit)
			.offset(offset);

		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(requests)
			.where(eq(requests.webhookId, inboxId));

		const nextPageToken = offset + events.length < count ? String(page + 1) : null;

		res.json({
			events: events.map((e) => ({
				id: e.id,
				method: e.method,
				url: e.url,
				headers: e.headers,
				queryParams: e.queryParams,
				body: e.body,
				rawBody: e.rawBody,
				ip: e.ip,
				timestamp: e.createdAt,
			})),
			nextPageToken,
			total: count,
		});
	} catch (err) {
		console.error("[events] list error:", err);
		res.status(500).json({ error: "Failed to fetch events" });
	}
});

router.get("/:inboxId/:eventId", async (req, res) => {
	try {
		const { inboxId, eventId } = req.params;
		const id = Number(eventId);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "Invalid event ID" });
			return;
		}

		const [event] = await db
			.select()
			.from(requests)
			.where(and(eq(requests.webhookId, inboxId), eq(requests.id, id)))
			.limit(1);

		if (!event) {
			res.status(404).json({ error: "Event not found" });
			return;
		}

		res.json({
			id: event.id,
			method: event.method,
			url: event.url,
			headers: event.headers,
			queryParams: event.queryParams,
			body: event.body,
			rawBody: event.rawBody,
			ip: event.ip,
			timestamp: event.createdAt,
		});
	} catch (err) {
		console.error("[events] get error:", err);
		res.status(500).json({ error: "Failed to fetch event" });
	}
});

export default router;
