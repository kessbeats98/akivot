"use client";

import type { OwnerPaymentPeriod } from "@/lib/services/billing/types";
import { OwnerPaymentSummaryCard } from "./components/OwnerPaymentSummaryCard";
import { OwnerCurrentPaymentCard } from "./components/OwnerCurrentPaymentCard";
import { OwnerPaymentHistorySection } from "./components/OwnerPaymentHistorySection";
import { OwnerPaymentsEmptyState } from "./components/OwnerPaymentsEmptyState";

interface Props {
  periods: OwnerPaymentPeriod[];
}

export function OwnerBillingClient({ periods }: Props) {
  const currentPeriods = periods.filter((p) => p.status === "OPEN" || p.status === "REOPENED");
  const historyPeriods = periods.filter((p) => p.status === "PAID" || p.status === "ARCHIVED");
  const openTotal = currentPeriods.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const isReopened = currentPeriods.some((p) => p.status === "REOPENED");

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <p className="text-brand/70 font-semibold text-sm mb-1">פירוט חיובים</p>
        <h1 className="text-3xl font-black text-dark tracking-tight">תשלומים</h1>
      </header>

      {/* Summary */}
      <OwnerPaymentSummaryCard
        openTotal={openTotal}
        hasOpen={currentPeriods.length > 0}
        isReopened={isReopened}
      />

      {/* Current open/reopened periods */}
      {currentPeriods.length > 0 && (
        <section className="px-6 mb-8">
          <h3 className="text-lg font-bold text-dark mb-4">בקשת תשלום נוכחית</h3>
          <div className="flex flex-col gap-4">
            {currentPeriods.map((p) => (
              <OwnerCurrentPaymentCard key={p.id} period={p} />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      <OwnerPaymentHistorySection periods={historyPeriods} />

      {/* Empty state — zero periods total */}
      {periods.length === 0 && <OwnerPaymentsEmptyState />}
    </div>
  );
}
