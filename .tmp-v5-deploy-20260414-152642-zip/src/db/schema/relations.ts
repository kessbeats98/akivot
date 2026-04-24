import { relations } from "drizzle-orm";
import { users, walkerProfiles, userDevices, invites } from "./users";
import { dogs, dogOwners, dogWalkers } from "./dogs";
import { walkBatches, walks, walkMedia } from "./walks";
import { paymentPeriods, paymentEntries } from "./billing";
import { notificationDeliveries } from "./notifications";
import { auditLogs } from "./audit";

// users
export const usersRelations = relations(users, ({ one, many }) => ({
  walkerProfile: one(walkerProfiles, {
    fields: [users.id],
    references: [walkerProfiles.userId],
  }),
  devices: many(userDevices),
  createdInvites: many(invites),
  ownedDogs: many(dogOwners),
  auditLogs: many(auditLogs),
}));

// walkerProfiles
export const walkerProfilesRelations = relations(
  walkerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [walkerProfiles.userId],
      references: [users.id],
    }),
    invites: many(invites),
    dogWalkers: many(dogWalkers),
    walkBatches: many(walkBatches),
    paymentPeriods: many(paymentPeriods),
  }),
);

// userDevices
export const userDevicesRelations = relations(userDevices, ({ one, many }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
  notificationDeliveries: many(notificationDeliveries),
}));

// invites
export const invitesRelations = relations(invites, ({ one }) => ({
  walkerProfile: one(walkerProfiles, {
    fields: [invites.walkerProfileId],
    references: [walkerProfiles.id],
  }),
  createdByUser: one(users, {
    fields: [invites.createdByUserId],
    references: [users.id],
  }),
}));

// dogs
export const dogsRelations = relations(dogs, ({ many }) => ({
  owners: many(dogOwners),
  walkers: many(dogWalkers),
  walks: many(walks),
}));

// dogOwners
export const dogOwnersRelations = relations(dogOwners, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogOwners.dogId],
    references: [dogs.id],
  }),
  ownerUser: one(users, {
    fields: [dogOwners.ownerUserId],
    references: [users.id],
  }),
}));

// dogWalkers
export const dogWalkersRelations = relations(dogWalkers, ({ one, many }) => ({
  dog: one(dogs, {
    fields: [dogWalkers.dogId],
    references: [dogs.id],
  }),
  walkerProfile: one(walkerProfiles, {
    fields: [dogWalkers.walkerProfileId],
    references: [walkerProfiles.id],
  }),
  walks: many(walks),
}));

// walkBatches
export const walkBatchesRelations = relations(
  walkBatches,
  ({ one, many }) => ({
    walkerProfile: one(walkerProfiles, {
      fields: [walkBatches.walkerProfileId],
      references: [walkerProfiles.id],
    }),
    startedByUser: one(users, {
      fields: [walkBatches.startedByUserId],
      references: [users.id],
    }),
    endedByUser: one(users, {
      fields: [walkBatches.endedByUserId],
      references: [users.id],
    }),
    walks: many(walks),
  }),
);

// walks
export const walksRelations = relations(walks, ({ one, many }) => ({
  dog: one(dogs, {
    fields: [walks.dogId],
    references: [dogs.id],
  }),
  walkerProfile: one(walkerProfiles, {
    fields: [walks.walkerProfileId],
    references: [walkerProfiles.id],
  }),
  dogWalker: one(dogWalkers, {
    fields: [walks.dogWalkerId],
    references: [dogWalkers.id],
  }),
  walkBatch: one(walkBatches, {
    fields: [walks.walkBatchId],
    references: [walkBatches.id],
  }),
  // Application-level only — no DB FK (circular import prevention)
  paymentPeriod: one(paymentPeriods, {
    fields: [walks.paymentPeriodId],
    references: [paymentPeriods.id],
  }),
  media: many(walkMedia),
  // Application-level only — no DB FK (circular import prevention)
  paymentEntries: many(paymentEntries),
}));

// walkMedia
export const walkMediaRelations = relations(walkMedia, ({ one }) => ({
  walk: one(walks, {
    fields: [walkMedia.walkId],
    references: [walks.id],
  }),
  uploadedByUser: one(users, {
    fields: [walkMedia.uploadedByUserId],
    references: [users.id],
  }),
}));

// paymentPeriods
export const paymentPeriodsRelations = relations(
  paymentPeriods,
  ({ one, many }) => ({
    walkerProfile: one(walkerProfiles, {
      fields: [paymentPeriods.walkerProfileId],
      references: [walkerProfiles.id],
    }),
    ownerUser: one(users, {
      fields: [paymentPeriods.ownerUserId],
      references: [users.id],
    }),
    paidByUser: one(users, {
      fields: [paymentPeriods.paidByUserId],
      references: [users.id],
    }),
    reopenedByUser: one(users, {
      fields: [paymentPeriods.reopenedByUserId],
      references: [users.id],
    }),
    entries: many(paymentEntries),
    // Application-level only — no DB FK (circular import prevention)
    walks: many(walks),
  }),
);

// paymentEntries
export const paymentEntriesRelations = relations(paymentEntries, ({ one }) => ({
  paymentPeriod: one(paymentPeriods, {
    fields: [paymentEntries.paymentPeriodId],
    references: [paymentPeriods.id],
  }),
  // Application-level only — no DB FK (circular import prevention)
  walk: one(walks, {
    fields: [paymentEntries.walkId],
    references: [walks.id],
  }),
  ownerUser: one(users, {
    fields: [paymentEntries.ownerUserId],
    references: [users.id],
  }),
}));

// notificationDeliveries
export const notificationDeliveriesRelations = relations(
  notificationDeliveries,
  ({ one }) => ({
    userDevice: one(userDevices, {
      fields: [notificationDeliveries.userDeviceId],
      references: [userDevices.id],
    }),
  }),
);

// auditLogs
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actorUser: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));
