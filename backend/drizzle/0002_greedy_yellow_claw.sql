ALTER TABLE "webhooks" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
CREATE INDEX "idx_webhooks_slug" ON "webhooks" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_slug_unique" UNIQUE("slug");