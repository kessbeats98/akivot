-- Migration 0006: repair notification_deliveries schema drift
--
-- Root cause: on the production branch the table was manually created before
-- Drizzle was introduced, with a different column layout (type/title/body/walk_id
-- etc.). Migration 0000 was recorded as applied without running its CREATE TABLE,
-- so the drift was never caught.
--
-- Safety guards:
--   1. If the table already has the correct schema (column "notification_type"
--      exists), this migration is a no-op.
--   2. If the legacy schema is present and the table is NOT empty, raise an
--      exception instead of deleting data.
--   3. If the legacy schema is present and the table IS empty, drop and recreate.
--
-- Enum types (notification_type, entity_type, notification_delivery_status)
-- already exist on both branches — they are NOT recreated here.

DO $$
BEGIN
  -- Check whether the table already has the correct schema.
  -- "notification_type" column only exists in the target schema.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'notification_deliveries'
      AND column_name  = 'notification_type'
  ) THEN
    -- Already correct — nothing to do.
    RAISE NOTICE 'notification_deliveries already matches target schema, skipping repair.';
    RETURN;
  END IF;

  -- Legacy schema detected. Abort if there is any data.
  IF (SELECT COUNT(*) FROM notification_deliveries) > 0 THEN
    RAISE EXCEPTION
      'notification_deliveries has rows (%) — cannot repair without data loss. Migrate data manually first.',
      (SELECT COUNT(*) FROM notification_deliveries);
  END IF;

  -- Table is empty and has wrong schema: drop and recreate.
  DROP TABLE notification_deliveries;

  CREATE TABLE "notification_deliveries" (
    "id"                uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_device_id"    uuid        NOT NULL,
    "notification_type" "notification_type"          NOT NULL,
    "entity_type"       "entity_type"                NOT NULL,
    "entity_id"         text        NOT NULL,
    "status"            "notification_delivery_status" NOT NULL,
    "error_message"     text,
    "sent_at"           timestamp with time zone,
    "created_at"        timestamp with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "notification_deliveries"
    ADD CONSTRAINT "notification_deliveries_user_device_id_user_devices_id_fk"
    FOREIGN KEY ("user_device_id")
    REFERENCES "user_devices"("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

  RAISE NOTICE 'notification_deliveries repaired successfully.';
END;
$$;
