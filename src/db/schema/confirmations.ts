import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { walkConfirmationStateEnum } from "./_enums";
import { dogs } from "./dogs";
import { users, walkerProfiles } from "./users";

export const walkConfirmations = pgTable(
  "walk_confirmations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dogId: uuid("dog_id")
      .references(() => dogs.id)
      .notNull(),
    walkerProfileId: uuid("walker_profile_id")
      .references(() => walkerProfiles.id)
      .notNull(),
    state: walkConfirmationStateEnum("state").notNull(),
    lastUnsureAt: timestamp("last_unsure_at", { withTimezone: true }),
    lastUpdatedByUserId: text("last_updated_by_user_id")
      .references(() => users.id)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("walk_confirmations_dog_id_unique").on(t.dogId)],
);
