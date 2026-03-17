"use client";

import { useState } from "react";
import type { OwnerPaymentPeriod } from "@/lib/services/billing/types";
import { OwnerPaymentEntriesList } from "./OwnerPaymentEntriesList";

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const statusConfig = {
  OPEN: { label: "פתוח", className: "bg-accent/10 text-accent" },
  REOPENED: { label: "עודכן", className: "bg-amber-100 text-amber-700" },
} as const;

interface Props {
  period: OwnerPaymentPeriod;
}

export function OwnerCurrentPaymentCard({ period }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[period.status as keyof typeof statusConfig] ?? statusConfig.OPEN;

  return (
    <div className="bg-white rounded-[2rem] shadow-glass border border-white/60 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-5 text-right"
        aria-expanded={expanded}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${config.className}`}>
              {config.label}
            </span>
          </div>
          <span className={`material-symbols-rounded text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="font-bold text-dark text-sm">{period.walkerDisplayName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{period.entries.length} פריטים</p>
          </div>
          <p className="text-2xl font-black font-numbers text-brand">
            {formatCurrency(period.totalAmount)}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="pt-4">
            <OwnerPaymentEntriesList entries={period.entries} />
          </div>
        </div>
      )}
    </div>
  );
}
