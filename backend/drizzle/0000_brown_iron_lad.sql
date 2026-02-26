CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"method" varchar(10) NOT NULL,
	"url" text NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"query_params" jsonb DEFAULT '{}'::jsonb,
	"body" text,
	"ip" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhooks_webhook_id_unique" UNIQUE("webhook_id")
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_webhook_id_webhooks_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("webhook_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_requests_webhook_id" ON "requests" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "idx_requests_created_at" ON "requests" USING btree ("created_at");