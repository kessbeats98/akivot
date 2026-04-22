CREATE TYPE "public"."adjustment_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'REQUEST_ADJUSTMENT';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'APPROVE_ADJUSTMENT';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'REJECT_ADJUSTMENT';--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'ADJUSTMENT_REQUEST';--> statement-breakpoint
CREATE TABLE "adjustment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_period_id" uuid NOT NULL,
	"walk_id" uuid NOT NULL,
	"owner_user_id" text NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"requested_by" text NOT NULL,
	"old_price" numeric(10, 2) NOT NULL,
	"new_price" numeric(10, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" "adjustment_request_status" DEFAULT 'pending' NOT NULL,
	"owner_approved_at" timestamp with time zone,
	"walker_approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "adjustment_requests_requested_by_check" CHECK (requested_by IN ('owner', 'walker'))
);
--> statement-breakpoint
ALTER TABLE "adjustment_requests" ADD CONSTRAINT "adjustment_requests_payment_period_id_payment_periods_id_fk" FOREIGN KEY ("payment_period_id") REFERENCES "public"."payment_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_requests" ADD CONSTRAINT "adjustment_requests_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_requests" ADD CONSTRAINT "adjustment_requests_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "adjustment_requests_pending_unique" ON "adjustment_requests" USING btree ("payment_period_id","walk_id") WHERE status = 'pending';