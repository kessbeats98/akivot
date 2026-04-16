"use client";

import { useState, useTransition } from "react";
import type { OwnerPaymentPeriod } from "@/lib/services/billing/types";
import { OwnerPaymentEntriesList } from "./OwnerPaymentEntriesList";
import { reopenPeriodAction } from "../actions";

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

function HistoryItem({ period }: { period: OwnerPaymentPeriod }) {
  const [expanded, setExpanded] = useState(false);
  const isPaid = period.status === "PAID";
  const [showReopen, setShowReopen] = useState(false);
  const [isReopening, startReopen] = useTransition();
  const [reopenError, setReopenError] = useState<string | null>(null);

  function handleReopen() {
    startReopen(async () => {
      setReopenError(null);
      try {
        const fd = new FormData();
        fd.append("lockVersion", String(period.lockVersion));
        await reopenPeriodAction(period.id, fd);
        setShowReopen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "Conflict") setReopenError("הנתונים השתנו — רענן את הדף ונסה שוב.");
        else if (msg === "Active period exists") setReopenError("קיימת תקופה פעילה לספק זה. סגור אותה תחילה.");
        else setReopenError("שגיאה בפתיחת התקופה. נסה שוב.");
      }
    });
  }
  const dateLabel = period.paidAt
    ? new Date(period.paidAt).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "ארכיון";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 text-right flex justify-between items-center"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPaid ? "bg-green-50 text-green-500" : "bg-gray-100 text-gray-400"}`}>
            <span className="material-symbols-rounded text-xl">
              {isPaid ? "check_circle" : "inventory_2"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-dark">{period.walkerDisplayName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{dateLabel} · {period.entries.length} פריטים</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold font-numbers text-dark">{formatCurrency(period.totalAmount)}</span>
          <span className={`material-symbols-rounded text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3">
            <OwnerPaymentEntriesList entries={period.entries} />

            {isPaid && !showReopen && (
              <button
                type="button"
                onClick={() => setShowReopen(true)}
                className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
              >
                פתח מחדש
              </button>
            )}

            {isPaid && showReopen && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800 text-center">לפתוח את התקופה מחדש?</p>
                <p className="text-xs text-amber-600 text-center">
                  התקופה תחזור לסטטוס פעיל ותוכל לסגור אותה מחדש.
                </p>
                {reopenError && (
                  <p className="text-xs text-red-500 text-center">{reopenError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowReopen(false); setReopenError(null); }}
                    disabled={isReopening}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 disabled:opacity-50"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleReopen}
                    disabled={isReopening}
                    className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold disabled:opacity-60"
                  >
                    {isReopening ? "פותח..." : "פתח מחדש"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  periods: OwnerPaymentPeriod[];
}

export function OwnerPaymentHistorySection({ periods }: Props) {
  if (periods.length === 0) return null;

  return (
    <section className="px-6 mb-6">
      <h3 className="text-lg font-bold text-dark mb-4">היסטוריה</h3>
      <div className="flex flex-col gap-3">
        {periods.map((p) => (
          <HistoryItem key={p.id} period={p} />
        ))}
      </div>
    </section>
  );
}
