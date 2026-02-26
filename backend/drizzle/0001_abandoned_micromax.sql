ALTER TABLE "requests" ALTER COLUMN "body" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "raw_body" text;--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "name" varchar(255);