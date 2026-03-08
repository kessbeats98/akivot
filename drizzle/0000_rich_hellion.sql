CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'START_WALK', 'END_WALK', 'AUTO_CLOSE_WALK', 'CANCEL_WALK', 'CLOSE_PAYMENT_PERIOD', 'MARK_PAYMENT_PAID', 'REOPEN_PAYMENT_PERIOD', 'REGISTER_DEVICE', 'INVALIDATE_DEVICE', 'SEND_NOTIFICATION', 'UPLOAD_MEDIA');--> statement-breakpoint
CREATE TYPE "public"."closure_reason" AS ENUM('MANUAL', 'AUTO_TIMEOUT', 'CANCELLED', 'SYSTEM_FIX');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('USER', 'WALKER_PROFILE', 'DOG', 'DOG_OWNER', 'DOG_WALKER', 'WALK_BATCH', 'WALK', 'WALK_MEDIA', 'PAYMENT_PERIOD', 'PAYMENT_ENTRY', 'USER_DEVICE', 'INVITE', 'NOTIFICATION_DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('ACTIVE', 'EXPIRED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('VERCEL_BLOB');--> statement-breakpoint
CREATE TYPE "public"."media_upload_status" AS ENUM('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."notification_delivery_status" AS ENUM('PENDING', 'SENT', 'FAILED', 'TOKEN_INVALID');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('WALK_STARTED', 'WALK_COMPLETED', 'AUTO_TIMEOUT_WARNING', 'AUTO_CLOSED', 'ONBOARDING_REMINDER');--> statement-breakpoint
CREATE TYPE "public"."payment_entry_type" AS ENUM('WALK', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."payment_period_status" AS ENUM('OPEN', 'PAID', 'REOPENED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('IOS', 'ANDROID', 'WEB_DESKTOP');--> statement-breakpoint
CREATE TYPE "public"."walk_batch_status" AS ENUM('LIVE', 'COMPLETED', 'AUTO_CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."walk_media_type" AS ENUM('PHOTO');--> statement-breakpoint
CREATE TYPE "public"."walk_status" AS ENUM('PLANNED', 'LIVE', 'COMPLETED', 'AUTO_CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"invite_code" text NOT NULL,
	"phone" text,
	"email" text,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"status" "invite_status" NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"device_label" text,
	"fcm_token" text NOT NULL,
	"app_installed" boolean DEFAULT false NOT NULL,
	"notifications_enabled" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"invalidated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_devices_fcm_token_unique" UNIQUE("fcm_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "walker_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"public_slug" text,
	"invite_code" text NOT NULL,
	"is_accepting_clients" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "walker_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "walker_profiles_public_slug_unique" UNIQUE("public_slug"),
	CONSTRAINT "walker_profiles_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "dog_owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dog_id" uuid NOT NULL,
	"owner_user_id" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dog_owners_dog_id_owner_user_id_unique" UNIQUE("dog_id","owner_user_id")
);
--> statement-breakpoint
CREATE TABLE "dog_walkers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dog_id" uuid NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'ILS' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "dog_walkers_dog_id_walker_profile_id_unique" UNIQUE("dog_id","walker_profile_id")
);
--> statement-breakpoint
CREATE TABLE "dogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"breed" text,
	"birth_date" date,
	"image_url" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walk_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"status" "walk_batch_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"started_by_user_id" text NOT NULL,
	"ended_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walk_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walk_id" uuid NOT NULL,
	"media_type" "walk_media_type" NOT NULL,
	"storage_provider" "media_provider" NOT NULL,
	"storage_key" text,
	"public_url" text,
	"uploaded_by_user_id" text NOT NULL,
	"upload_status" "media_upload_status" NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dog_id" uuid NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"dog_walker_id" uuid NOT NULL,
	"walk_batch_id" uuid,
	"status" "walk_status" NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration_minutes" integer,
	"final_price" numeric(10, 2),
	"closure_reason" "closure_reason",
	"note" text,
	"payment_period_id" uuid,
	"completed_at" timestamp with time zone,
	"auto_closed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"status_updated_at" timestamp with time zone NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_period_id" uuid NOT NULL,
	"walk_id" uuid,
	"owner_user_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"entry_type" "payment_entry_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_entries_payment_period_id_walk_id_unique" UNIQUE("payment_period_id","walk_id")
);
--> statement-breakpoint
CREATE TABLE "payment_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walker_profile_id" uuid NOT NULL,
	"owner_user_id" text NOT NULL,
	"status" "payment_period_status" NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paid_at" timestamp with time zone,
	"paid_by_user_id" text,
	"reopened_at" timestamp with time zone,
	"reopened_by_user_id" text,
	"lock_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_device_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"status" "notification_delivery_status" NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walker_profiles" ADD CONSTRAINT "walker_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog_owners" ADD CONSTRAINT "dog_owners_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog_owners" ADD CONSTRAINT "dog_owners_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog_walkers" ADD CONSTRAINT "dog_walkers_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog_walkers" ADD CONSTRAINT "dog_walkers_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_batches" ADD CONSTRAINT "walk_batches_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_batches" ADD CONSTRAINT "walk_batches_started_by_user_id_users_id_fk" FOREIGN KEY ("started_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_batches" ADD CONSTRAINT "walk_batches_ended_by_user_id_users_id_fk" FOREIGN KEY ("ended_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_media" ADD CONSTRAINT "walk_media_walk_id_walks_id_fk" FOREIGN KEY ("walk_id") REFERENCES "public"."walks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_media" ADD CONSTRAINT "walk_media_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_dog_walker_id_dog_walkers_id_fk" FOREIGN KEY ("dog_walker_id") REFERENCES "public"."dog_walkers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_walk_batch_id_walk_batches_id_fk" FOREIGN KEY ("walk_batch_id") REFERENCES "public"."walk_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walks" ADD CONSTRAINT "walks_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_entries" ADD CONSTRAINT "payment_entries_payment_period_id_payment_periods_id_fk" FOREIGN KEY ("payment_period_id") REFERENCES "public"."payment_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_entries" ADD CONSTRAINT "payment_entries_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_periods" ADD CONSTRAINT "payment_periods_walker_profile_id_walker_profiles_id_fk" FOREIGN KEY ("walker_profile_id") REFERENCES "public"."walker_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_periods" ADD CONSTRAINT "payment_periods_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_periods" ADD CONSTRAINT "payment_periods_paid_by_user_id_users_id_fk" FOREIGN KEY ("paid_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_periods" ADD CONSTRAINT "payment_periods_reopened_by_user_id_users_id_fk" FOREIGN KEY ("reopened_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_device_id_user_devices_id_fk" FOREIGN KEY ("user_device_id") REFERENCES "public"."user_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;