"use server";
import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { closePeriodSchema } from "@/lib/validation/billing";
import {
  getPeriodsByOwner,
  closePaymentPeriod,
  assertPeriodOwnership,
  ensureOpenPeriods,
} from "@/lib/repositories/billingRepo";
import type { OwnerBillingData } from "@/lib/services/billing/types";

export async function getOwnerBillingAction(): Promise<OwnerBillingData> {
  const user = await assertAuthenticated();
  await ensureOpenPeriods(user.id);
  const periods = await getPeriodsByOwner(user.id);
  return { periods };
}

// periodId bound via .bind(null, periodId); FormData: lockVersion (hidden input)
export async function closePeriodAction(periodId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertPeriodOwnership(periodId, user.id);
  const input = closePeriodSchema.parse({ periodId, lockVersion: formData.get("lockVersion") });
  await closePaymentPeriod(input, user.id);
  revalidatePath("/owner/billing");
}
