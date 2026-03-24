"use client";

import type { OwnerPaymentEntry } from "@/lib/services/billing/types";

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const formatDate = (d: Date | null) =>
  d
    ? new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "תאריך לא ידוע";

const walkStatusHebrew: Record<string, string> = {
  LIVE: "פעיל",
  COMPLETED: "הושלם",
  AUTO_CLOSED: "נסגר אוטומטית",
  AUTO_TIMEOUT: "פג תוקף",
  CANCELLED: "בוטל",
};

interface Props {
  entries: OwnerPaymentEntry[];
}

export function OwnerPaymentEntriesList({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-4">אין פריטים בתקופה זו</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm"
        >
          {entry.entryType === "WALK" ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-brand flex-shrink-0">
                <span className="material-symbols-rounded text-xl">directions_walk</span>
              </div>
              <div>
                <p className="font-bold text-sm text-dark">
                  {entry.dogName ?? "כלב לא ידוע"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">{formatDate(entry.walkDate)}</p>
                  {entry.walkStatus && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                      {walkStatusHebrew[entry.walkStatus] ?? entry.walkStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-gray-500 flex-shrink-0">
                <span className="material-symbols-rounded text-xl">tune</span>
              </div>
              <div>
                <p className="font-bold text-sm text-dark">התאמה</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
          )}
          <span className="font-bold font-numbers text-dark mr-2">{formatCurrency(entry.amount)}</span>
        </div>
      ))}
    </div>
  );
}
