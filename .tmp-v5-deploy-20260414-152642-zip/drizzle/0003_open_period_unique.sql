CREATE UNIQUE INDEX "payment_periods_open_unique_idx"
  ON "payment_periods" ("owner_user_id", "walker_profile_id")
  WHERE "status" = 'OPEN';
