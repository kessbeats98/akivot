import {
  boolean,
  char,
  date,
  decimal,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users, walkerProfiles } from "./users";

export const dogs = pgTable("dogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  breed: text("breed"),
  birthDate: date("birth_date"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const dogOwners = pgTable(
  "dog_owners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dogId: uuid("dog_id")
      .references(() => dogs.id)
      .notNull(),
    ownerUserId: text("owner_user_id")
      .references(() => users.id)
      .notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.dogId, t.ownerUserId)],
);

export const dogWalkers = pgTable(
  "dog_walkers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dogId: uuid("dog_id")
      .references(() => dogs.id)
      .notNull(),
    walkerProfileId: uuid("walker_profile_id")
      .references(() => walkerProfiles.id)
      .notNull(),
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 }).notNull().default("ILS"),
    isActive: boolean("is_active").notNull().default(true),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [unique().on(t.dogId, t.walkerProfileId)],
);
