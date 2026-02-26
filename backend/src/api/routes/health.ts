import { sql } from "drizzle-orm";
import type { Router } from "express";
import { Router as createRouter } from "express";
import { db } from "../../db.js";

const router: Router = createRouter();

router.get("/", async (_req, res) => {
	try {
		await db.execute(sql`SELECT 1`);
		res.json({ status: "ok", service: "webhooklab-backend", database: "connected" });
	} catch {
		res.status(503).json({
			status: "error",
			service: "webhooklab-backend",
			database: "disconnected",
		});
	}
});

export default router;
