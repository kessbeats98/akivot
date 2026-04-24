"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { users } from "@/db/schema";
import { assertAuthenticated } from "@/lib/auth/session";
import { validatePhone } from "@/lib/phone";

export type PhoneUpdateResult = { ok: true } | { ok: false; error: string };

/**
 * Updates the *current* user's own phone. A user cannot edit anyone else's phone.
 * Used by owner settings and walker settings to complete phone for quick contact
 * actions (WhatsApp / call) around walks and open billing periods.
 */
export async function updateOwnPhoneAction(
  raw: string,
): Promise<PhoneUpdateResult> {
  const user = await assertAuthenticated();
  const cleaned = validatePhone(raw);
  if (!cleaned) return { ok: false, error: "INVALID_PHONE" };
  const db = getDb();
  await db
    .update(users)
    .set({ phone: cleaned, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/owner/settings");
  revalidatePath("/walker/settings");
  revalidatePath("/owner/billing");
  revalidatePath("/walker/billing");
  return { ok: true };
}
