import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walks, dogOwners } from "@/db/schema";
import {
  getActiveDevicesForUser,
  invalidateDevice,
  logDelivery,
} from "@/lib/repositories/notificationsRepo";
import type { NotificationPayload, SendResult } from "./types";

// Lazy singleton — never called at import time (env vars not available at build)
let adminApp: import("firebase-admin/app").App | null = null;

function getAdminApp(): import("firebase-admin/app").App {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin env vars not set (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
  }

  const { initializeApp, getApps, cert } = require("firebase-admin/app") as typeof import("firebase-admin/app");
  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0]!;
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Private key from env may have literal \n — replace with real newlines
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
  return adminApp;
}

export async function sendToDevice(token: string, payload: NotificationPayload): Promise<SendResult> {
  try {
    const app = getAdminApp();
    const { getMessaging } = require("firebase-admin/messaging") as typeof import("firebase-admin/messaging");
    const messaging = getMessaging(app);

    const messageId = await messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    return { success: true, messageId };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? "";
    const invalidTokenCodes = [
      "messaging/invalid-registration-token",
      "messaging/registration-token-not-registered",
    ];
    if (invalidTokenCodes.includes(code)) {
      return { success: false, invalidToken: true, error: code };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, invalidToken: false, error: message };
  }
}

export async function notifyWalkEvent(
  walkId: string,
  type: "WALK_STARTED" | "WALK_COMPLETED",
): Promise<void> {
  try {
    const db = getDb();

    // Fetch walk → dogId
    const [walk] = await db
      .select({ dogId: walks.dogId })
      .from(walks)
      .where(eq(walks.id, walkId))
      .limit(1);
    if (!walk) return;

    // Fetch all owner userIds for this dog
    const ownerRows = await db
      .select({ ownerUserId: dogOwners.ownerUserId })
      .from(dogOwners)
      .where(eq(dogOwners.dogId, walk.dogId));
    if (ownerRows.length === 0) return;

    const payload: NotificationPayload = {
      title: type === "WALK_STARTED" ? "Walk started" : "Walk completed",
      body: type === "WALK_STARTED"
        ? "Your dog's walk has started."
        : "Your dog's walk has been completed.",
      data: { walkId, type },
    };

    for (const { ownerUserId } of ownerRows) {
      const devices = await getActiveDevicesForUser(ownerUserId);

      for (const device of devices) {
        const result = await sendToDevice(device.fcmToken, payload);
        const now = new Date();

        if (result.success) {
          await logDelivery({
            userDeviceId: device.id,
            notificationType: type,
            entityType: "WALK",
            entityId: walkId,
            status: "SENT",
            sentAt: now,
          });
        } else {
          const status = result.invalidToken ? "TOKEN_INVALID" : "FAILED";
          await logDelivery({
            userDeviceId: device.id,
            notificationType: type,
            entityType: "WALK",
            entityId: walkId,
            status,
            errorMessage: result.error,
          });
          if (result.invalidToken) {
            await invalidateDevice(device.fcmToken);
          }
        }
      }
    }
  } catch (err) {
    // Fire-and-forget — never throw; log error but don't block walk lifecycle
    console.error("[notifyWalkEvent] error:", err);
  }
}
