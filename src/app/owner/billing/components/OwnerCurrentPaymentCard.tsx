"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { OwnerPaymentPeriod } from "@/lib/services/billing/types";
import { OwnerPaymentEntriesList } from "./OwnerPaymentEntriesList";
import { closePeriodAction } from "../actions";

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const statusConfig = {
  OPEN: { label: "פתוח", className: "bg-accent/10 text-accent" },
  REOPENED: { label: "חשבון נפתח לתיקון", className: "bg-amber-100 text-amber-700" },
} as const;

interface Props {
  period: OwnerPaymentPeriod;
  hasOwnerPhone: boolean;
}

export function OwnerCurrentPaymentCard({ period, hasOwnerPhone }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[period.status as keyof typeof statusConfig] ?? statusConfig.OPEN;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [closeError, setCloseError] = useState<string | null>(null);

  function handleClose() {
    startTransition(async () => {
      setCloseError(null);
      const fd = new FormData();
      fd.append("lockVersion", String(period.lockVersion));
      try {
        const result = await closePeriodAction(period.id, fd);
        if (!result.ok) {
          switch (result.code) {
            case "CONFLICT":
              setCloseError("החשבון עודכן בינתיים — רענן את הדף ונסה שוב.");
              return;
            case "PERIOD_NOT_OPEN":
              setCloseError("החשבון כבר אושר.");
              return;
            case "FORBIDDEN":
              setCloseError("אין הרשאה לעדכן את החשבון הזה.");
              return;
            case "INVALID_INPUT":
              setCloseError("בקשה לא תקינה. רענן את הדף ונסה שוב.");
              return;
            case "PERIOD_NOT_FOUND":
              setCloseError("החשבון לא נמצא.");
              return;
            default:
              setCloseError("שגיאה באישור החשבון. נסה שוב.");
              return;
          }
        }
        setShowConfirm(false);
      } catch {
        setCloseError("שגיאה באישור החשבון. נסה שוב.");
      }
    });
  }

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
            <p className="text-xs text-gray-400 mt-0.5">
              {period.pendingWalkCount > 0
                ? `${period.pendingWalkCount} טיולים ממתינים`
                : period.entries.length > 0
                  ? `${period.entries.length} פריטים`
                  : "אין טיולים עדיין"}
            </p>
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
          {period.pendingWalkCount > 0 && !showConfirm && hasOwnerPhone && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="mt-4 w-full bg-brand text-white py-4 rounded-2xl font-bold text-base shadow-glow-brand transition-transform active:scale-95"
            >
              אשר חשבון ({period.pendingWalkCount} טיולים)
            </button>
          )}

          {period.pendingWalkCount > 0 && !hasOwnerPhone && (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-surface p-4 text-center space-y-2">
              <p className="text-sm font-semibold text-dark">נדרש מספר טלפון לאישור החשבון</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                המספר משמש את המטפל ליצירת קשר סביב חיוב פתוח.
              </p>
              <Link
                href="/owner/settings"
                className="inline-block text-xs font-semibold text-brand"
              >
                הוספה בהגדרות
              </Link>
            </div>
          )}

          {period.pendingWalkCount > 0 && showConfirm && (
            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-dark text-center">
                לאשר חשבון עם {period.pendingWalkCount} טיולים?
              </p>
              <p className="text-xs text-gray-400 text-center">
                הסכום יחושב לפי המחיר הנוכחי של כל טיול. לא ניתן לבטל.
              </p>
              {closeError && (
                <p className="text-xs text-red-500 text-center">{closeError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowConfirm(false); setCloseError(null); }}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 disabled:opacity-50"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-bold shadow-glow-brand disabled:opacity-60"
                >
                  {isPending ? "מאשר..." : "אשר חשבון"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
