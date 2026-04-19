import { pgEnum } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("platform", [
  "IOS",
  "ANDROID",
  "WEB_DESKTOP",
]);

export const walkStatusEnum = pgEnum("walk_status", [
  "PLANNED",
  "LIVE",
  "COMPLETED",
  "AUTO_CLOSED",
  "CANCELLED",
]);

export const walkBatchStatusEnum = pgEnum("walk_batch_status", [
  "LIVE",
  "COMPLETED",
  "AUTO_CLOSED",
  "CANCELLED",
]);

export const closureReasonEnum = pgEnum("closure_reason", [
  "MANUAL",
  "AUTO_TIMEOUT",
  "CANCELLED",
  "SYSTEM_FIX",
]);

export const walkMediaTypeEnum = pgEnum("walk_media_type", ["PHOTO"]);

export const mediaProviderEnum = pgEnum("media_provider", ["VERCEL_BLOB"]);

export const mediaUploadStatusEnum = pgEnum("media_upload_status", [
  "PENDING",
  "UPLOADING",
  "UPLOADED",
  "FAILED",
]);

export const paymentPeriodStatusEnum = pgEnum("payment_period_status", [
  "OPEN",
  "PAID",
  "REOPENED",
  "ARCHIVED",
]);

export const paymentEntryTypeEnum = pgEnum("payment_entry_type", [
  "WALK",
  "ADJUSTMENT",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "WALK_STARTED",
  "WALK_COMPLETED",
  "AUTO_TIMEOUT_WARNING",
  "AUTO_CLOSED",
  "ONBOARDING_REMINDER",
]);

export const notificationDeliveryStatusEnum = pgEnum(
  "notification_delivery_status",
  ["PENDING", "SENT", "FAILED", "TOKEN_INVALID"],
);

export const entityTypeEnum = pgEnum("entity_type", [
  "USER",
  "WALKER_PROFILE",
  "DOG",
  "DOG_OWNER",
  "DOG_WALKER",
  "WALK_BATCH",
  "WALK",
  "WALK_MEDIA",
  "PAYMENT_PERIOD",
  "PAYMENT_ENTRY",
  "USER_DEVICE",
  "INVITE",
  "NOTIFICATION_DELIVERY",
  "PRICE_AGREEMENT",
  "WALK_PRICE_OFFER",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "START_WALK",
  "END_WALK",
  "AUTO_CLOSE_WALK",
  "CANCEL_WALK",
  "CLOSE_PAYMENT_PERIOD",
  "MARK_PAYMENT_PAID",
  "REOPEN_PAYMENT_PERIOD",
  "REGISTER_DEVICE",
  "INVALIDATE_DEVICE",
  "SEND_NOTIFICATION",
  "UPLOAD_MEDIA",
  "PROPOSE_PRICE_AGREEMENT",
  "APPROVE_PRICE_AGREEMENT",
  "REJECT_PRICE_AGREEMENT",
  "PROPOSE_WALK_OFFER",
  "ACCEPT_WALK_OFFER",
  "REJECT_WALK_OFFER",
]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "ACTIVE",
  "EXPIRED",
  "DISABLED",
]);

export const priceAgreementStatusEnum = pgEnum("price_agreement_status", [
  "pending",
  "active",
  "superseded",
  "rejected",
]);

export const walkPriceOfferStatusEnum = pgEnum("walk_price_offer_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
  "superseded",
]);
