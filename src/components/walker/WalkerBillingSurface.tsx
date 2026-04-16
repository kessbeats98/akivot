"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, CheckCircle2, ChevronLeft, Phone, Receipt, Send } from "lucide-react";
import { SlideOver } from "@/components/ui/slide-over";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";

interface Props {
  periods: PaymentPeriodWithEntries[];
}

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const statusLabel = (status: string) => {
  switch (status) {
    case "PAID":
      return "שולם";
    case "REOPENED":
      return "נפתח מחדש";
    case "ARCHIVED":
      return "בארכיון";
    default:
      return "פתוח";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "REOPENED":
      return "bg-amber-100 text-amber-700";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-brand/10 text-brand";
  }
};

export function WalkerBillingSurface({ periods }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriodWithEntries | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const pendingPeriods = periods.filter((period) => period.status === "OPEN" || period.status === "REOPENED");
  const paidPeriods = periods.filter((period) => period.status === "PAID" || period.status === "ARCHIVED");
  const totalOpen = pendingPeriods.reduce((sum, period) => sum + Number(period.totalAmount), 0);
  const openWalks = pendingPeriods.reduce((sum, period) => sum + period.entries.length, 0);

  const openPeriod = (period: PaymentPeriodWithEntries) => {
    setSelectedPeriod(period);
    setIsDetailOpen(true);
  };

  const handleSendReminder = (period: PaymentPeriodWithEntries) => {
    const message = `היי, רציתי להזכיר שיש תשלום פתוח על סך ${formatCurrency(period.totalAmount)}. תודה!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <Link
          href="/walker/dashboard"
          className="inline-flex items-center gap-1 text-brand/60 text-sm font-medium mb-3 hover:text-brand transition-colors"
        >
          <span className="material-symbols-rounded text-base">arrow_forward</span>
          בית
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand/70 mb-1">גבייה</p>
            <h1 className="text-xl font-semibold text-dark tracking-tight">כספים</h1>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-color mb-1">פתוח כרגע</p>
              <p className="text-3xl font-black font-numbers text-dark tracking-tight">
                {formatCurrency(totalOpen)}
              </p>
            </div>
            <span className="text-[11px] text-muted-color text-left leading-5">
              {pendingPeriods.length > 0
                ? "כאן רואים מה עדיין ממתין להסדרה"
                : "אין כרגע חיובים פתוחים"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl bg-surface px-4 py-3 border border-gray-100">
              <p className="text-xs text-muted-color mb-1">לקוחות פתוחים</p>
              <p className="text-lg font-bold font-numbers text-dark">{pendingPeriods.length}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-3 border border-gray-100">
              <p className="text-xs text-muted-color mb-1">טיולים בחיוב</p>
              <p className="text-lg font-bold font-numbers text-dark">{openWalks}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-dark">ממתין לתשלום</h2>
            {pendingPeriods.length > 0 && (
              <span className="text-xs font-medium text-muted-color">{pendingPeriods.length} תקופות פתוחות</span>
            )}
          </div>

          <div className="space-y-3">
            {pendingPeriods.length > 0 ? (
              pendingPeriods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => openPeriod(period)}
                  className="w-full bg-white rounded-2xl border border-gray-100 px-4 py-4 text-right transition-colors active:scale-[0.99] hover:border-gray-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0">
                        <Receipt size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-dark">תקופת חיוב</h3>
                        <p className="text-xs text-muted-color mt-0.5">
                          {period.entries.length} טיולים
                        </p>
                      </div>
                    </div>

                    <ChevronLeft size={18} className="text-gray-300 shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor(period.status)}`}>
                      {statusLabel(period.status)}
                    </span>

                    <div className="text-left">
                      <p className="text-lg font-bold font-numbers text-dark">
                        {formatCurrency(period.totalAmount)}
                      </p>
                      <p className="text-[11px] text-muted-color">לחץ לפירוט</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-base font-semibold text-dark mb-1">הכול שולם</p>
                <p className="text-sm text-muted-color">אין כרגע חיובים פתוחים מול בעלי הכלבים.</p>
              </div>
            )}
          </div>
        </section>

        {paidPeriods.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-dark">היסטוריית תשלומים</h2>
              <span className="text-xs text-muted-color">לעיון כשצריך</span>
            </div>

            <div className="space-y-2">
              {paidPeriods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => openPeriod(period)}
                  className="w-full bg-white rounded-2xl border border-gray-100 px-4 py-3 text-right transition-colors hover:border-gray-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark">
                          {period.paidAt
                            ? new Date(period.paidAt).toLocaleDateString("he-IL")
                            : "שולם"}
                        </p>
                        <p className="text-xs text-muted-color">{period.entries.length} טיולים</p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <p className="text-sm font-bold font-numbers text-dark">
                        {formatCurrency(period.totalAmount)}
                      </p>
                      <p className="text-[11px] text-muted-color">{statusLabel(period.status)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="פירוט חשבון"
      >
        {selectedPeriod && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-light text-brand flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-dark">תקופת חיוב</h3>
                    <p className="text-sm text-muted-color mt-0.5">
                      {selectedPeriod.entries.length} טיולים
                    </p>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor(selectedPeriod.status)}`}>
                  {statusLabel(selectedPeriod.status)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-muted-color">סה״כ לתשלום</span>
                <span className="text-2xl font-black font-numbers text-dark">
                  {formatCurrency(selectedPeriod.totalAmount)}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-dark mb-4">פירוט טיולים</h4>

              <div className="space-y-3">
                {selectedPeriod.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-surface text-muted-color flex items-center justify-center shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark">
                          {entry.entryType === "WALK" ? "טיול" : "התאמה"}
                        </p>
                        <p className="text-xs text-muted-color">
                          {new Date(entry.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold font-numbers text-dark shrink-0">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}

                {selectedPeriod.entries.length === 0 && (
                  <p className="text-sm text-muted-color text-center py-3">אין טיולים עדיין</p>
                )}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSendReminder(selectedPeriod)}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-center transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
                  <Send size={18} />
                </div>
                <p className="text-sm font-semibold text-dark">שלח תזכורת</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  // TODO: owner phone from period data
                }}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-center transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Phone size={18} />
                </div>
                <p className="text-sm font-semibold text-dark">התקשר לבעלים</p>
              </button>
            </section>

            <p className="text-xs text-center text-muted-color">
              רק בעל הכלב יכול לסמן חשבון כשולם.
            </p>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
