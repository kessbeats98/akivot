import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  entityTypeEnum,
  notificationDeliveryStatusEnum,
  notificationTypeEnum,
} from "./_enums";
import { userDevices } from "./users";

export const notificationDeliveries = pgTable("notification_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userDeviceId: uuid("user_device_id")
    .references(() => userDevices.id)
    .notNull(),
  notificationType: notificationTypeEnum("notification_type").notNull(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  status: notificationDeliveryStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
