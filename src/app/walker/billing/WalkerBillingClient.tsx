"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Receipt, Send, Phone, Calendar, CheckCircle2 } from "lucide-react";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const statusLabel = (status: string) => {
  switch (status) {
    case "PAID": return "שולם";
    case "REOPENED": return "נפתח מחדש";
    case "ARCHIVED": return "בארכיון";
    default: return "פתוח";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "PAID": return "bg-green-100 text-green-700";
    case "REOPENED": return "bg-yellow-100 text-yellow-700";
    case "ARCHIVED": return "bg-gray-100 text-gray-500";
    default: return "bg-accent/10 text-accent";
  }
};

interface Props {
  periods: PaymentPeriodWithEntries[];
}

export function WalkerBillingClient({ periods: initialPeriods }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriodWithEntries | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Only show OPEN + REOPENED as "pending"
  const pendingPeriods = initialPeriods.filter((p) => p.status === "OPEN" || p.status === "REOPENED");
  const paidPeriods = initialPeriods.filter((p) => p.status === "PAID" || p.status === "ARCHIVED");
  const totalOpen = pendingPeriods.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  const handleSendReminder = (period: PaymentPeriodWithEntries) => {
    const message = `היי, רציתי להזכיר שיש תשלום פתוח על סך ${formatCurrency(period.totalAmount)}. תודה!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-end z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">הכנסות ולקוחות</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">כספים</h1>
        </div>
      </header>

      {/* Summary Card */}
      <section className="px-6 mb-8 mt-2">
        <div className="relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-brand-light/80 font-medium mb-1">סה״כ פתוח לגבייה</p>
            <span className="text-5xl font-black font-numbers tracking-tighter">
              {formatCurrency(totalOpen)}
            </span>
            <div className="flex gap-4 w-full mt-6">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-xs text-white/60 mb-1">לקוחות פתוחים</p>
                <p className="font-bold font-numbers text-lg">{pendingPeriods.length}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-xs text-white/60 mb-1">סה״כ טיולים</p>
                <p className="font-bold font-numbers text-lg">
                  {pendingPeriods.reduce((sum, p) => sum + p.entries.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Payments */}
      <section className="px-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-dark">מחכים לתשלום</h3>
          <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
            {pendingPeriods.length} לקוחות
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {pendingPeriods.length > 0 ? (
            pendingPeriods.map((period) => (
              <div
                key={period.id}
                onClick={() => {
                  setSelectedPeriod(period);
                  setIsDetailOpen(true);
                }}
                className="bg-white rounded-[2rem] p-5 shadow-glass border border-white/60 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-brand">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">תקופת חיוב</h4>
                      <p className="text-xs text-gray-400">
                        {period.entries.length} טיולים ·{" "}
                        <span className={`${statusColor(period.status)} px-1.5 py-0.5 rounded text-[10px]`}>
                          {statusLabel(period.status)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black font-numbers text-brand">
                      {formatCurrency(period.totalAmount)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">לחץ לפירוט</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-dark font-black text-xl mb-1">הכל שולם!</p>
              <p className="text-gray-400 font-medium">אין חובות פתוחים כרגע.</p>
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

      {/* Detail SlideOver */}
      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="פירוט חשבון"
      >
        {selectedPeriod && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-surface p-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand border-2 border-white shadow-sm">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-dark">תקופת חיוב</h3>
                <p className="text-gray-500 font-medium">{selectedPeriod.entries.length} טיולים</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold">סה״כ לתשלום</span>
                <span className="text-3xl font-black font-numbers text-brand">
                  {formatCurrency(selectedPeriod.totalAmount)}
                </span>
              </div>

              {/* Entries list */}
              <div className="space-y-3">
                {selectedPeriod.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-dark">
                          {entry.entryType === "WALK" ? "טיול" : "התאמה"}
                        </span>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>
                    <span className="font-numbers font-bold text-dark">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
                {selectedPeriod.entries.length === 0 && (
                  <p className="text-center text-gray-400 py-4">אין טיולים עדיין</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSendReminder(selectedPeriod)}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <span className="text-xs font-bold text-dark">שלח תזכורת</span>
              </button>
              <button
                onClick={() => {
                  /* TODO: owner phone from period data */
                }}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <span className="text-xs font-bold text-dark">התקשר לבעלים</span>
              </button>
            </div>

            <div className="mt-2 text-center text-xs text-gray-400">
              רק הלקוח יכול לסמן חשבון כשולם
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
