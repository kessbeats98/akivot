'use server';
import { PaymentPeriodWithEntries } from '@/lib/services/billing/types';

export async function getWalkerBillingAction(): Promise<{ periods: PaymentPeriodWithEntries[] }> {
  return { periods: [] };
}
