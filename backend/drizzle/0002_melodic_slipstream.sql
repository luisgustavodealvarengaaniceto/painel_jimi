ALTER TABLE "fixed_content" ADD COLUMN "tenant" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "tenant" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant" text DEFAULT 'default' NOT NULL;