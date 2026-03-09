"use server";
import { assertAuthenticated } from "@/lib/auth/session";
import { getPeriodsByWalker } from "@/lib/repositories/billingRepo";
import type { WalkerBillingData } from "@/lib/services/billing/types";

export async function getWalkerBillingAction(): Promise<WalkerBillingData> {
  const user = await assertAuthenticated();
  const periods = await getPeriodsByWalker(user.id);
  return { periods };
}
