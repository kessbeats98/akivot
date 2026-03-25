"use client";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

interface Props {
  openTotal: number;
  hasOpen: boolean;
  isReopened: boolean;
}

export function OwnerPaymentSummaryCard({ openTotal, hasOpen, isReopened }: Props) {
  if (!hasOpen) {
    return (
      <section className="px-6 mb-8 mt-2">
        <div className="bg-white rounded-[2rem] p-8 shadow-glass border border-white/60 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-3xl">check_circle</span>
          </div>
          <p className="text-dark font-black text-xl mb-1">אין בקשת תשלום פתוחה כרגע</p>
          <p className="text-gray-400 font-medium text-sm">כל הפריטים טופלו</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8 mt-2">
      <div className="relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <p className="text-brand-light/80 font-medium mb-1">
            {isReopened ? "בקשת תשלום עודכנה" : "בקשת תשלום פתוחה"}
          </p>
          <span className="text-5xl font-black font-numbers tracking-tighter">
            {formatCurrency(openTotal)}
          </span>
        </div>
      </div>
    </section>
  );
}
