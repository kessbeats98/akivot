CREATE TYPE "public"."walk_confirmation_state" AS ENUM('WAITING', 'CONFIRMED', 'NOT_NEEDED');--> statement-breakpoint
CREATE TABLE "walk_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dog_id" uuid NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"state" "walk_confirmation_state" NOT NULL,
	"last_unsure_at" timestamp with time zone,
	"last_updated_by_user_id" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "walk_confirmations" ADD CONSTRAINT "walk_confirmations_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_confirmations" ADD CONSTRAINT "walk_confirmations_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_confirmations" ADD CONSTRAINT "walk_confirmations_last_updated_by_user_id_users_id_fk" FOREIGN KEY ("last_updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "walk_confirmations_dog_id_unique" ON "walk_confirmations" USING btree ("dog_id");