import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { userDevices, notificationDeliveries } from "@/db/schema";
import type { RegisterDeviceInput } from "@/lib/validation/devices";
import type { DeviceRegistration, LogDeliveryInput } from "@/lib/services/notifications/types";

export async function upsertDevice(userId: string, input: RegisterDeviceInput): Promise<string> {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select({ id: userDevices.id })
    .from(userDevices)
    .where(eq(userDevices.fcmToken, input.fcmToken))
    .limit(1);

  if (existing) {
    // Update to ensure notificationsEnabled=true and updatedAt refreshed
    await db
      .update(userDevices)
      .set({ notificationsEnabled: true, updatedAt: now })
      .where(eq(userDevices.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db
    .insert(userDevices)
    .values({
      userId,
      platform: input.platform,
      fcmToken: input.fcmToken,
      notificationsEnabled: true,
      updatedAt: now,
    })
    .returning({ id: userDevices.id });

  if (!inserted) throw new Error("Insert failed");
  return inserted.id;
}

export async function invalidateDevice(fcmToken: string): Promise<void> {
  const db = getDb();
  await db
    .update(userDevices)
    .set({ invalidatedAt: new Date(), updatedAt: new Date() })
    .where(eq(userDevices.fcmToken, fcmToken));
}

export async function getActiveDevicesForUser(userId: string): Promise<DeviceRegistration[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: userDevices.id,
      userId: userDevices.userId,
      platform: userDevices.platform,
      fcmToken: userDevices.fcmToken,
      notificationsEnabled: userDevices.notificationsEnabled,
      invalidatedAt: userDevices.invalidatedAt,
    })
    .from(userDevices)
    .where(
      eq(userDevices.userId, userId),
    );

  return rows
    .filter((r) => r.invalidatedAt === null && r.notificationsEnabled)
    .map((r) => ({
      ...r,
      platform: r.platform as "WEB_DESKTOP",
    }));
}

export async function logDelivery(input: LogDeliveryInput): Promise<void> {
  const db = getDb();
  await db.insert(notificationDeliveries).values({
    userDeviceId: input.userDeviceId,
    notificationType: input.notificationType,
    entityType: input.entityType,
    entityId: input.entityId,
    status: input.status,
    errorMessage: input.errorMessage ?? null,
    sentAt: input.sentAt ?? null,
  });
}
