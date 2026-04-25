"use server";
import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { closePeriodSchema } from "@/lib/validation/billing";
import {
  getPeriodsByOwner,
  closePaymentPeriod,
  assertPeriodOwnership,
  ensureOpenPeriods,
  getOwnerPaymentPeriodsEnriched,
} from "@/lib/repositories/billingRepo";
import type { OwnerBillingData, OwnerPaymentPeriod } from "@/lib/services/billing/types";

export type BillingActionResult =
  | { ok: true }
  | {
      ok: false;
      code: BillingActionErrorCode;
    };

type BillingActionErrorCode =
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "PERIOD_NOT_OPEN"
  | "PERIOD_NOT_FOUND";

function mapKnownBillingError(error: unknown): BillingActionErrorCode | null {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Forbidden") return "FORBIDDEN";
  if (msg === "Conflict") return "CONFLICT";
  if (msg === "Period not open") return "PERIOD_NOT_OPEN";
  if (msg === "Period not found") return "PERIOD_NOT_FOUND";
  return null;
}

export async function getOwnerBillingAction(): Promise<OwnerBillingData> {
  const user = await assertAuthenticated();
  await ensureOpenPeriods(user.id);
  const periods = await getPeriodsByOwner(user.id);
  return { periods };
}

// Pure read — no ensureOpenPeriods, no mutations
export async function getOwnerPaymentsAction(): Promise<OwnerPaymentPeriod[]> {
  const user = await assertAuthenticated();
  return getOwnerPaymentPeriodsEnriched(user.id);
}

// Used by billing page — ensures open periods exist then returns enriched data
export async function getOwnerBillingPageAction(): Promise<OwnerPaymentPeriod[]> {
  const user = await assertAuthenticated();
  await ensureOpenPeriods(user.id);
  return getOwnerPaymentPeriodsEnriched(user.id);
}

// periodId bound via .bind(null, periodId); FormData: lockVersion (hidden input)
export async function closePeriodAction(periodId: string, formData: FormData): Promise<BillingActionResult> {
  const user = await assertAuthenticated();
  const parsed = closePeriodSchema.safeParse({ periodId, lockVersion: formData.get("lockVersion") });
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    await assertPeriodOwnership(periodId, user.id);
    await closePaymentPeriod(parsed.data, user.id);
    revalidatePath("/owner/billing");
    return { ok: true };
  } catch (error) {
    const code = mapKnownBillingError(error);
    if (!code) throw error;
    return { ok: false, code };
  }
}

