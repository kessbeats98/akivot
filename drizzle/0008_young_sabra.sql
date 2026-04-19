CREATE TYPE "public"."walk_price_offer_status" AS ENUM('pending', 'accepted', 'rejected', 'expired', 'superseded');--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'PROPOSE_WALK_OFFER';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'ACCEPT_WALK_OFFER';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'REJECT_WALK_OFFER';--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'WALK_PRICE_OFFER';--> statement-breakpoint
CREATE TABLE "walk_price_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walk_id" uuid,
	"owner_user_id" text NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"dog_id" uuid NOT NULL,
	"proposed_by" text NOT NULL,
	"proposed_price" numeric(10, 2) NOT NULL,
	"proposed_duration_min" integer,
	"status" "walk_price_offer_status" DEFAULT 'pending' NOT NULL,
	"supersedes_offer_id" uuid,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "walk_price_offers" ADD CONSTRAINT "walk_price_offers_proposed_by_check" CHECK (proposed_by IN ('owner', 'walker'));--> statement-breakpoint
ALTER TABLE "walk_price_offers" ADD CONSTRAINT "walk_price_offers_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_price_offers" ADD CONSTRAINT "walk_price_offers_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_price_offers" ADD CONSTRAINT "walk_price_offers_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;