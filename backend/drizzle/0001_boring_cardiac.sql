CREATE TABLE IF NOT EXISTS "slide_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"slide_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slide_attachments" ADD CONSTRAINT "slide_attachments_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
