ALTER TABLE "walks" ALTER COLUMN "updated_by_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "actor_user_id" DROP NOT NULL;