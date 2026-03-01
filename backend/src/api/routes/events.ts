import type { Router } from "express";
import { Router as createRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db.js";
import { pool } from "../../db/index.js";
import { requests, webhooks } from "../../db/schema.js";

const VALID_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
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

// Stats for an inbox - must be before GET /:inboxId
router.get("/:inboxId/stats", async (req, res) => {
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

		const result = await pool.query(
			`SELECT COUNT(*)::int AS count,
			        COALESCE(SUM(LENGTH(COALESCE(raw_body, body::text, ''))), 0)::bigint AS total_size
			 FROM requests WHERE webhook_id = $1`,
			[inboxId],
		);
		const row = result.rows[0] as { count: number; total_size: string } | undefined;
		const count = Number(row?.count ?? 0);
		const totalSize = Number(row?.total_size ?? 0);

		res.json({ count, totalSize });
	} catch (err) {
		console.error("[events] stats error:", err);
		res.status(500).json({ error: "Failed to fetch stats" });
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
		const search = typeof req.query.search === "string" ? req.query.search.slice(0, 200) : undefined;
		const method = typeof req.query.method === "string" ? req.query.method.toUpperCase() : undefined;
		const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
		const ip = typeof req.query.ip === "string" ? req.query.ip.slice(0, 45) : undefined;
		const requestId = req.query.requestId != null ? Number(req.query.requestId) : undefined;

		const VALID_STATUS_FILTERS = ["2xx", "4xx", "5xx"];
		if (statusFilter && !VALID_STATUS_FILTERS.includes(statusFilter)) {
			res.status(400).json({ error: "Invalid status filter — use 2xx, 4xx, or 5xx" });
			return;
		}
		if (method && !VALID_METHODS.includes(method)) {
			res.status(400).json({ error: "Invalid HTTP method filter" });
			return;
		}
		if (requestId != null && (Number.isNaN(requestId) || requestId < 1)) {
			res.status(400).json({ error: "Invalid requestId — must be a positive integer" });
			return;
		}

		const [webhook] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.webhookId, inboxId))
			.limit(1);

		if (!webhook) {
			res.status(404).json({ error: "Webhook inbox not found" });
			return;
		}

		const hasFilters = search || method || statusFilter || ip || (requestId != null && !Number.isNaN(requestId));

		if (!hasFilters) {
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

			return res.json({
				events: events.map((e) => ({
					id: e.id,
					method: e.method,
					url: e.url,
					headers: e.headers,
					queryParams: e.queryParams,
					body: e.body,
					rawBody: e.rawBody,
					ip: e.ip,
					status: e.status ?? 200,
					timestamp: e.createdAt,
				})),
				nextPageToken,
				total: count,
				pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
			});
		}

		const conditions: string[] = ["webhook_id = $1"];
		const params: unknown[] = [inboxId];
		let paramIndex = 2;

		if (method) {
			conditions.push(`method = $${paramIndex}`);
			params.push(method);
			paramIndex++;
		}
		if (ip) {
			conditions.push(`ip ILIKE $${paramIndex}`);
			params.push(`%${ip}%`);
			paramIndex++;
		}
		if (requestId != null && !Number.isNaN(requestId)) {
			conditions.push(`id = $${paramIndex}`);
			params.push(requestId);
			paramIndex++;
		}
		if (statusFilter) {
			if (statusFilter === "2xx") {
				conditions.push(`COALESCE(status, 200) BETWEEN 200 AND 299`);
			} else if (statusFilter === "4xx") {
				conditions.push(`COALESCE(status, 200) BETWEEN 400 AND 499`);
			} else if (statusFilter === "5xx") {
				conditions.push(`COALESCE(status, 200) BETWEEN 500 AND 599`);
			}
		}
		if (search) {
			conditions.push(`(
				headers::text ILIKE $${paramIndex}
				OR query_params::text ILIKE $${paramIndex}
				OR COALESCE(raw_body, '') ILIKE $${paramIndex}
				OR COALESCE(ip, '') ILIKE $${paramIndex}
			)`);
			params.push(`%${search}%`);
			paramIndex++;
		}

		const whereClause = conditions.join(" AND ");
		const countResult = await pool.query(
			`SELECT COUNT(*)::int AS total FROM requests WHERE ${whereClause}`,
			params,
		);
		const total = countResult.rows[0]?.total ?? 0;

		const dataResult = await pool.query(
			`SELECT * FROM requests WHERE ${whereClause}
			 ORDER BY created_at DESC
			 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
			[...params, limit, offset],
		);

		const events = dataResult.rows.map((row) => ({
			id: row.id,
			method: row.method,
			url: row.url,
			headers: row.headers ?? {},
			queryParams: row.query_params ?? {},
			body: row.body,
			rawBody: row.raw_body,
			ip: row.ip,
			status: row.status ?? 200,
			timestamp: row.created_at,
		}));

		res.json({
			events,
			nextPageToken: offset + events.length < total ? String(page + 1) : null,
			total,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
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
			status: event.status ?? 200,
			timestamp: event.createdAt,
		});
	} catch (err) {
		console.error("[events] get error:", err);
		res.status(500).json({ error: "Failed to fetch event" });
	}
});

export default router;
