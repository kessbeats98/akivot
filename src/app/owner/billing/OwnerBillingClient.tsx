"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { CheckCircle2, Calendar } from "lucide-react";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

interface Props {
  periods: PaymentPeriodWithEntries[];
  closePeriodAction: (periodId: string, formData: FormData) => Promise<void>;
}

export function OwnerBillingClient({ periods: initialPeriods, closePeriodAction }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriodWithEntries | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const openPeriods = initialPeriods.filter(
    (p) => p.status === "OPEN" || p.status === "REOPENED",
  );
  const paidPeriods = initialPeriods.filter(
    (p) => p.status === "PAID" || p.status === "ARCHIVED",
  );
  const totalOpen = openPeriods.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  const handlePay = async (period: PaymentPeriodWithEntries) => {
    setIsPaying(true);
    try {
      const fd = new FormData();
      fd.set("lockVersion", String(period.lockVersion));
      await closePeriodAction(period.id, fd);
      setIsDetailOpen(false);
      // Page will revalidate via revalidatePath in the action
    } catch {
      alert("שגיאה בביצוע התשלום. ייתכן שהנתונים השתנו, אנא רענן.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <p className="text-brand/70 font-semibold text-sm mb-1">פירוט חיובים</p>
        <h1 className="text-3xl font-black text-dark tracking-tight">תשלומים</h1>
      </header>

      {/* Summary */}
      {totalOpen > 0 && (
        <section className="px-6 mb-8 mt-2">
          <div className="relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-center">
              <p className="text-brand-light/80 font-medium mb-1">יתרה פתוחה</p>
              <span className="text-5xl font-black font-numbers tracking-tighter">
                {formatCurrency(totalOpen)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Open Periods */}
      <section className="px-6 mb-8">
        <h3 className="text-lg font-bold text-dark mb-4">חשבונות פתוחים</h3>
        <div className="flex flex-col gap-4">
          {openPeriods.length > 0 ? (
            openPeriods.map((period) => (
              <div
                key={period.id}
                onClick={() => {
                  setSelectedPeriod(period);
                  setIsDetailOpen(true);
                }}
                className="bg-white rounded-[2rem] p-5 shadow-glass border border-white/60 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-dark">תקופת חיוב</h4>
                  <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
                    פתוח
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-gray-400">
                    {period.entries.length} טיולים
                  </p>
                  <p className="text-2xl font-black font-numbers text-brand">
                    {formatCurrency(period.totalAmount)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-dark font-black text-xl mb-1">הכל שולם!</p>
              <p className="text-gray-400 font-medium">אין חשבונות פתוחים.</p>
            </div>
          )}
        </div>
      </section>

      {/* Paid History */}
      {paidPeriods.length > 0 && (
        <section className="px-6 mb-6">
          <h3 className="text-lg font-bold text-dark mb-4">היסטוריה</h3>
          <div className="flex flex-col gap-3">
            {paidPeriods.map((period) => (
              <div
                key={period.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">
                      {period.paidAt
                        ? new Date(period.paidAt).toLocaleDateString("he-IL")
                        : "שולם"}
                    </p>
                    <p className="text-xs text-gray-400">{period.entries.length} טיולים</p>
                  </div>
                </div>
                <span className="font-bold font-numbers text-dark">
                  {formatCurrency(period.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Period Detail SlideOver */}
      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="פירוט חשבון"
      >
        {selectedPeriod && (
          <div className="flex flex-col gap-6">
            {/* Total */}
            <div className="bg-brand/5 rounded-3xl p-6 border border-brand/10 text-center">
              <p className="text-brand/60 text-sm font-bold mb-1">סה״כ לתשלום</p>
              <span className="text-4xl font-black font-numbers text-brand">
                {formatCurrency(selectedPeriod.totalAmount)}
              </span>
            </div>

            {/* Entries */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-dark px-1">פירוט טיולים</h4>
              {selectedPeriod.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-brand">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-dark">
                        {entry.entryType === "WALK" ? "טיול" : "התאמה"}
                      </p>
                      <p className="text-xs text-gray-400 font-numbers">
                        {new Date(entry.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold font-numbers text-dark">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
              {selectedPeriod.entries.length === 0 && (
                <p className="text-center text-gray-400 py-4">אין טיולים עדיין</p>
              )}
            </div>

            {/* Pay Button */}
            {(selectedPeriod.status === "OPEN" || selectedPeriod.status === "REOPENED") && (
              <button
                onClick={() => handlePay(selectedPeriod)}
                disabled={isPaying}
                className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-rounded">payments</span>
                {isPaying ? "מעבד..." : "סמן כשולם"}
              </button>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
