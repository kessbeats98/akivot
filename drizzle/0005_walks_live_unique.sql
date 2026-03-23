-- Fix duplicate LIVE walks before adding uniqueness constraint.
-- Keep the latest (by start_time) per (dog_id, walker_profile_id); cancel the rest.
UPDATE "walks" SET
  "status" = 'CANCELLED',
  "closure_reason" = 'SYSTEM_FIX',
  "cancelled_at" = NOW(),
  "status_updated_at" = NOW(),
  "updated_at" = NOW()
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id",
           ROW_NUMBER() OVER (
             PARTITION BY "dog_id", "walker_profile_id"
             ORDER BY "start_time" DESC
           ) AS rn
    FROM "walks"
    WHERE "status" = 'LIVE' AND "deleted_at" IS NULL
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX "walks_live_unique_idx"
  ON "walks" ("dog_id", "walker_profile_id")
  WHERE "status" = 'LIVE' AND "deleted_at" IS NULL;
