"use server";
import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { reopenPeriodSchema } from "@/lib/validation/billing";
import {
  getPeriodsByWalker,
  getUnbilledWalksForWalker,
  reopenPaymentPeriod,
  assertWalkerPeriodOwnership,
} from "@/lib/repositories/billingRepo";
import type { WalkerBillingData } from "@/lib/services/billing/types";

export type WalkerBillingActionResult =
  | { ok: true }
  | { ok: false; code: WalkerBillingActionErrorCode };

type WalkerBillingActionErrorCode =
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "PERIOD_NOT_PAID"
  | "ACTIVE_PERIOD_EXISTS"
  | "PERIOD_NOT_FOUND";

function mapKnownBillingError(error: unknown): WalkerBillingActionErrorCode | null {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Forbidden") return "FORBIDDEN";
  if (msg === "Conflict") return "CONFLICT";
  if (msg === "Period not paid") return "PERIOD_NOT_PAID";
  if (msg === "Active period exists") return "ACTIVE_PERIOD_EXISTS";
  if (msg === "Period not found") return "PERIOD_NOT_FOUND";
  return null;
}

export async function getWalkerBillingAction(): Promise<WalkerBillingData> {
  const user = await assertAuthenticated();
  const [periods, unbilledWalks] = await Promise.all([
    getPeriodsByWalker(user.id),
    getUnbilledWalksForWalker(user.id),
  ]);
  return { periods, unbilledWalks };
}

export async function reopenPeriodAction(periodId: string, formData: FormData): Promise<WalkerBillingActionResult> {
  const user = await assertAuthenticated();
  const parsed = reopenPeriodSchema.safeParse({ periodId, lockVersion: formData.get("lockVersion") });
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    await assertWalkerPeriodOwnership(periodId, user.id);
    await reopenPaymentPeriod(parsed.data, user.id);
    revalidatePath("/walker/billing");
    return { ok: true };
  } catch (error) {
    const code = mapKnownBillingError(error);
    if (!code) throw error;
    return { ok: false, code };
  }
}
