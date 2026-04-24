'use server';
import { PaymentPeriodWithEntries } from '@/lib/services/billing/types';

export async function getOwnerBillingAction(): Promise<{ periods: PaymentPeriodWithEntries[] }> {
  return { periods: [] };
}
export async function closePeriodAction(periodId: string, lockVersion: number) {}
