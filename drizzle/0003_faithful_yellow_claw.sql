ALTER TABLE "classes" ADD COLUMN "paced_by_teacher" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "current_step_order" integer DEFAULT 1 NOT NULL;