CREATE TYPE "public"."price_agreement_status" AS ENUM('pending', 'active', 'superseded', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'PROPOSE_PRICE_AGREEMENT';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'APPROVE_PRICE_AGREEMENT';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'REJECT_PRICE_AGREEMENT';--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'PRICE_AGREEMENT';--> statement-breakpoint
CREATE TABLE "price_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"dog_id" uuid NOT NULL,
	"proposed_by" text NOT NULL,
	"proposed_price" numeric(10, 2) NOT NULL,
	"currency" char(3) DEFAULT 'ILS' NOT NULL,
	"effective_from" text DEFAULT 'next_walk' NOT NULL,
	"status" "price_agreement_status" DEFAULT 'pending' NOT NULL,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_approved_at" timestamp with time zone,
	"walker_approved_at" timestamp with time zone,
	"superseded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_agreements" ADD CONSTRAINT "price_agreements_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_agreements" ADD CONSTRAINT "price_agreements_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_agreements" ADD CONSTRAINT "price_agreements_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "price_agreements_active_trio_unique" ON "price_agreements" USING btree ("owner_user_id","walker_profile_id","dog_id") WHERE status = 'active';--> statement-breakpoint
ALTER TABLE "price_agreements" ADD CONSTRAINT "price_agreements_superseded_by_id_fkey" FOREIGN KEY ("superseded_by_id") REFERENCES "price_agreements"("id");--> statement-breakpoint
ALTER TABLE "price_agreements" ADD CONSTRAINT "price_agreements_proposed_by_check" CHECK (proposed_by IN ('owner', 'walker'));