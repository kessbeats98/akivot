export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type SendResult =
  | { success: true; messageId: string }
  | { success: false; invalidToken: boolean; error?: string };

export type DeviceRegistration = {
  id: string;
  userId: string;
  platform: "WEB_DESKTOP";
  fcmToken: string;
  notificationsEnabled: boolean;
  invalidatedAt: Date | null;
};

export type LogDeliveryInput = {
  userDeviceId: string;
  notificationType: "WALK_STARTED" | "WALK_COMPLETED" | "AUTO_TIMEOUT_WARNING" | "AUTO_CLOSED" | "ONBOARDING_REMINDER";
  entityType: "WALK";
  entityId: string;
  status: "PENDING" | "SENT" | "FAILED" | "TOKEN_INVALID";
  errorMessage?: string;
  sentAt?: Date;
};
