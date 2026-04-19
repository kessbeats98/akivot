import {
  char,
  check,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adjustmentRequestStatusEnum, paymentEntryTypeEnum, paymentPeriodStatusEnum, priceAgreementStatusEnum, walkPriceOfferStatusEnum } from "./_enums";
import { users, walkerProfiles } from "./users";
import { dogs } from "./dogs";

export const paymentPeriods = pgTable("payment_periods", {
  id: uuid("id").primaryKey().defaultRandom(),
  walkerProfileId: uuid("walker_profile_id")
    .references(() => walkerProfiles.id)
    .notNull(),
  ownerUserId: text("owner_user_id")
    .references(() => users.id)
    .notNull(),
  status: paymentPeriodStatusEnum("status").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paidByUserId: text("paid_by_user_id").references(() => users.id),
  reopenedAt: timestamp("reopened_at", { withTimezone: true }),
  reopenedByUserId: text("reopened_by_user_id").references(() => users.id),
  lockVersion: integer("lock_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const paymentEntries = pgTable(
  "payment_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentPeriodId: uuid("payment_period_id")
      .references(() => paymentPeriods.id)
      .notNull(),
    // Intentionally no DB FK — circular import billing.ts ↔ walks.ts
    // Integrity enforced by closePaymentPeriodService transaction
    walkId: uuid("walk_id"),
    ownerUserId: text("owner_user_id")
      .references(() => users.id)
      .notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    entryType: paymentEntryTypeEnum("entry_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.paymentPeriodId, t.walkId)],
);

export const walkPriceOffers = pgTable("walk_price_offers", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  // Intentionally no DB FK — nullable, set on linkAndApply (circular import prevention)
  walkId:              uuid("walk_id"),
  ownerUserId:         text("owner_user_id").references(() => users.id).notNull(),
  walkerProfileId:     uuid("walker_profile_id").references(() => walkerProfiles.id).notNull(),
  dogId:               uuid("dog_id").references(() => dogs.id).notNull(),
  proposedBy:          text("proposed_by").notNull(),
  proposedPrice:       decimal("proposed_price", { precision: 10, scale: 2 }).notNull(),
  proposedDurationMin: integer("proposed_duration_min"),
  status:              walkPriceOfferStatusEnum("status").notNull().default("pending"),
  // Intentionally no DB FK — self-ref, app-level only
  supersedesOfferId:   uuid("supersedes_offer_id"),
  proposedAt:          timestamp("proposed_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt:         timestamp("responded_at", { withTimezone: true }),
  createdAt:           timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // At most one accepted unlinked pre-start offer per trio
  uniqueIndex("walk_price_offers_accepted_prestart_unique")
    .on(t.ownerUserId, t.walkerProfileId, t.dogId)
    .where(sql`status = 'accepted' AND walk_id IS NULL`),
]);

export const adjustmentRequests = pgTable("adjustment_requests", {
  id:               uuid("id").primaryKey().defaultRandom(),
  paymentPeriodId:  uuid("payment_period_id").references(() => paymentPeriods.id).notNull(),
  // No DB FK — integrity enforced in repo (same pattern as paymentEntries.walkId)
  walkId:           uuid("walk_id").notNull(),
  ownerUserId:      text("owner_user_id").references(() => users.id).notNull(),
  walkerProfileId:  uuid("walker_profile_id").references(() => walkerProfiles.id).notNull(),
  requestedBy:      text("requested_by").notNull(),
  oldPrice:         decimal("old_price",   { precision: 10, scale: 2 }).notNull(),
  newPrice:         decimal("new_price",   { precision: 10, scale: 2 }).notNull(),
  reason:           text("reason").notNull(),
  status:           adjustmentRequestStatusEnum("status").notNull().default("pending"),
  ownerApprovedAt:  timestamp("owner_approved_at",  { withTimezone: true }),
  walkerApprovedAt: timestamp("walker_approved_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("adjustment_requests_requested_by_check", sql`requested_by IN ('owner', 'walker')`),
  // At most one pending adjustment per (period, walk) — DB-level race protection
  uniqueIndex("adjustment_requests_pending_unique")
    .on(t.paymentPeriodId, t.walkId)
    .where(sql`status = 'pending'`),
]);

export const priceAgreements = pgTable(
  "price_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: text("owner_user_id").references(() => users.id).notNull(),
    walkerProfileId: uuid("walker_profile_id").references(() => walkerProfiles.id).notNull(),
    dogId: uuid("dog_id").references(() => dogs.id).notNull(),
    proposedBy: text("proposed_by").notNull(),
    proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 }).notNull().default("ILS"),
    effectiveFrom: text("effective_from").notNull().default("next_walk"),
    status: priceAgreementStatusEnum("status").notNull().default("pending"),
    proposedAt: timestamp("proposed_at", { withTimezone: true }).notNull().defaultNow(),
    ownerApprovedAt: timestamp("owner_approved_at", { withTimezone: true }),
    walkerApprovedAt: timestamp("walker_approved_at", { withTimezone: true }),
    supersededById: uuid("superseded_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("price_agreements_active_trio_unique")
      .on(t.ownerUserId, t.walkerProfileId, t.dogId)
      .where(sql`status = 'active'`),
  ],
);
