import { randomUUID } from "node:crypto";
import type { Router } from "express";
import { Router as createRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db.js";
import { webhooks } from "../../db/schema.js";
import { config } from "../../config.js";

const router: Router = createRouter();

/** Webhook URLs use frontend origin so we never expose backend URL */
function getWebhookBaseUrl(): string {
	return config.FRONTEND_URL.replace(/\/$/, "");
}

router.post("/create", async (req, res) => {
	try {
		const { name, slug } = req.body as { name?: string; slug?: string };
		const webhookId = randomUUID();

		// Slug: alphanumeric, hyphens, underscores only; 3-100 chars
		const cleanSlug =
			slug && /^[a-zA-Z0-9_-]{3,100}$/.test(slug) ? slug.toLowerCase() : null;

		await db.insert(webhooks).values({
			webhookId,
			slug: cleanSlug,
			name: name ?? null,
		});

		const path = cleanSlug ? `webhook/${cleanSlug}` : `webhook/${webhookId}`;
		const url = `${getWebhookBaseUrl()}/${path}`;
		res.status(201).json({ id: webhookId, slug: cleanSlug, url, name: name ?? null });
	} catch (err) {
		console.error("[webhooks] create error:", err);
		res.status(500).json({ error: "Failed to create webhook" });
	}
});

router.get("/by-slug/:slug", async (req, res) => {
	try {
		const { slug } = req.params;
		const [row] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.slug, slug))
			.limit(1);

		if (!row) {
			res.status(404).json({ error: "Webhook not found" });
			return;
		}

		const path = row.slug ? `webhook/${row.slug}` : `webhook/${row.webhookId}`;
		const url = `${getWebhookBaseUrl()}/${path}`;
		res.json({
			id: row.webhookId,
			slug: row.slug,
			url,
			name: row.name,
			createdAt: row.createdAt,
		});
	} catch (err) {
		console.error("[webhooks] get by slug error:", err);
		res.status(500).json({ error: "Failed to fetch webhook" });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const [row] = await db
			.select()
			.from(webhooks)
			.where(eq(webhooks.webhookId, id))
			.limit(1);

		if (!row) {
			res.status(404).json({ error: "Webhook not found" });
			return;
		}

		const path = row.slug ? `webhook/${row.slug}` : `webhook/${row.webhookId}`;
		const url = `${getWebhookBaseUrl()}/${path}`;
		res.json({
			id: row.webhookId,
			slug: row.slug,
			url,
			name: row.name,
			createdAt: row.createdAt,
		});
	} catch (err) {
		console.error("[webhooks] get error:", err);
		res.status(500).json({ error: "Failed to fetch webhook" });
	}
});

export default router;
