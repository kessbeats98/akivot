"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, CheckCircle2, ChevronLeft, Phone, Receipt, Send } from "lucide-react";
import { SlideOver } from "@/components/ui/slide-over";
import type { WalkerPaymentPeriod, UnbilledWalk } from "@/lib/services/billing/types";
import { normalizePhoneForWa, isUsablePhone } from "@/lib/phone";

interface Props {
  periods: WalkerPaymentPeriod[];
  unbilledWalks: UnbilledWalk[];
}

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));

const formatDate = (d: Date | null | string): string => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL");
};


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
    case "REOPENED": return "bg-amber-100 text-amber-700";
    case "ARCHIVED": return "bg-gray-100 text-gray-500";
    default: return "bg-brand/10 text-brand";
  }
};

function groupByOwner(walks: UnbilledWalk[]) {
  const map = new Map<string, { ownerUserId: string; ownerDisplayName: string | null; walks: UnbilledWalk[] }>();
  for (const w of walks) {
    if (!map.has(w.ownerUserId)) {
      map.set(w.ownerUserId, { ownerUserId: w.ownerUserId, ownerDisplayName: w.ownerDisplayName, walks: [] });
    }
    map.get(w.ownerUserId)!.walks.push(w);
  }
  return [...map.values()];
}

export function WalkerBillingSurface({ periods, unbilledWalks }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<WalkerPaymentPeriod | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const pendingPeriods = periods.filter((p) => p.status === "OPEN" || p.status === "REOPENED");
  const paidPeriods = periods.filter((p) => p.status === "PAID" || p.status === "ARCHIVED");
  const totalOpen = pendingPeriods.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const openItems = pendingPeriods.reduce((sum, p) => sum + p.entries.length, 0);
  const ownerGroups = groupByOwner(unbilledWalks);
  const multipleOwners = ownerGroups.length > 1;
  const hasUnbilledWalks = unbilledWalks.length > 0;

  const openPeriod = (period: WalkerPaymentPeriod) => {
    setSelectedPeriod(period);
    setIsDetailOpen(true);
  };

  // "Hi {name}, just reminding there is an open payment of {amount}. Thanks!"
  const buildReminderText = (period: WalkerPaymentPeriod) => {
    const greet = period.ownerDisplayName
      ? `היי ${period.ownerDisplayName},`
      : "היי,";
    return `${greet} רציתי להזכיר שיש תשלום פתוח על סך ${formatCurrency(period.totalAmount)}. תודה!`;
  };

  const handleWhatsApp = (period: WalkerPaymentPeriod) => {
    if (!isUsablePhone(period.ownerPhone)) return;
    const normalized = normalizePhoneForWa(period.ownerPhone!);
    if (!normalized) return;
    const text = encodeURIComponent(buildReminderText(period));
    window.open(`https://wa.me/${normalized}?text=${text}`, "_blank");
  };

  const handleCall = (period: WalkerPaymentPeriod) => {
    if (!isUsablePhone(period.ownerPhone)) return;
    window.location.href = `tel:${period.ownerPhone}`;
  };

  const isPeriodOpen = (status: string) => status === "OPEN" || status === "REOPENED";

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <Link
          href="/walker/dashboard"
          className="inline-flex items-center gap-1 text-brand/60 text-sm font-medium mb-3 hover:text-brand transition-colors"
        >
          <span className="material-symbols-rounded text-base">arrow_forward</span>
          {"בית"}
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand/70 mb-1">{"גבייה"}</p>
            <h1 className="text-xl font-semibold text-dark tracking-tight">{"כספים"}</h1>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Summary card */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-color mb-1">{"פתוח כרגע"}</p>
              <p className="text-3xl font-black font-numbers text-dark tracking-tight">
                {formatCurrency(totalOpen)}
              </p>
            </div>
            <span className="text-[11px] text-muted-color text-left leading-5">
              {pendingPeriods.length > 0
                ? "כאן רואים מה עדיין ממתין להסדרה"
                : hasUnbilledWalks
                  ? "טיולים הושלמו, אבל עוד לא נסגר חיוב"
                  : "אין כרגע חיובים פתוחים"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl bg-surface px-4 py-3 border border-gray-100">
              <p className="text-xs text-muted-color mb-1">{"לקוחות פתוחים"}</p>
              <p className="text-lg font-bold font-numbers text-dark">{pendingPeriods.length}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-3 border border-gray-100">
              <p className="text-xs text-muted-color mb-1">{"פריטים בחיוב"}</p>
              <p className="text-lg font-bold font-numbers text-dark">{openItems}</p>
            </div>
          </div>
        </section>

        {/* Unbilled walks */}
        {unbilledWalks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-dark">{"הושלמו — לא חויבו עדיין"}</h2>
              <span className="text-xs font-medium text-muted-color">{unbilledWalks.length} {"טיולים"}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              {ownerGroups.map((group) => (
                <div key={group.ownerUserId}>
                  {multipleOwners && group.ownerDisplayName && (
                    <p className="text-xs font-semibold text-muted-color mb-2">{group.ownerDisplayName}</p>
                  )}
                  <div className="space-y-2">
                    {group.walks.map((w) => (
                      <div
                        key={w.walkId}
                        className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-surface text-muted-color flex items-center justify-center shrink-0">
                            <Calendar size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-dark">{w.dogName}</p>
                            <p className="text-xs text-muted-color">{formatDate(w.walkDate)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold font-numbers text-dark shrink-0">
                          {formatCurrency(w.finalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-color pt-1">
                {"הטיולים האלה ייכללו בחיוב הבא שיסגור בעל הכלב."}
              </p>
            </div>
          </section>
        )}

        {/* Pending periods */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-dark">{"ממתין לתשלום"}</h2>
            {pendingPeriods.length > 0 && (
              <span className="text-xs font-medium text-muted-color">{pendingPeriods.length} {"תקופות פתוחות"}</span>
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
                        <h3 className="text-base font-semibold text-dark">
                          {period.ownerDisplayName ?? "תקופת חיוב"}
                        </h3>
                        <p className="text-xs text-muted-color mt-0.5">
                          {period.entries.length} {"פריטים"}
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
                      <p className="text-[11px] text-muted-color">{"לחץ לפירוט"}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-base font-semibold text-dark mb-1">{"הכול שולם"}</p>
                <p className="text-sm text-muted-color">{"אין כרגע חיובים פתוחים מול בעלי הכלבים."}</p>
              </div>
            )}
          </div>
        </section>

        {/* Payment history */}
        {paidPeriods.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-dark">{"היסטוריית תשלומים"}</h2>
              <span className="text-xs text-muted-color">{"לעיון כשצריך"}</span>
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
                          {period.paidAt ? formatDate(period.paidAt) : "שולם"}
                        </p>
                        <p className="text-xs text-muted-color">{period.entries.length} {"פריטים"}</p>
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
        title={"פירוט חשבון"}
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
                    <h3 className="text-base font-semibold text-dark">
                      {selectedPeriod.ownerDisplayName ?? "תקופת חיוב"}
                    </h3>
                    <p className="text-sm text-muted-color mt-0.5">
                      {selectedPeriod.entries.length} {"פריטים"}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor(selectedPeriod.status)}`}>
                  {statusLabel(selectedPeriod.status)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-muted-color">{"סה״כ לתשלום"}</span>
                <span className="text-2xl font-black font-numbers text-dark">
                  {formatCurrency(selectedPeriod.totalAmount)}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-dark mb-4">{"פירוט"}</h4>

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
                        {entry.entryType === "WALK" ? (
                          <>
                            <p className="text-sm font-semibold text-dark">{entry.dogName ?? "טיול"}</p>
                            <p className="text-xs text-muted-color">
                              {entry.walkDate ? formatDate(entry.walkDate) : formatDate(entry.createdAt)}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                {"התאמה"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-color mt-0.5">
                              {Number(entry.amount) >= 0 ? "חיוב נוסף" : "זיכוי"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-sm font-bold font-numbers text-dark shrink-0">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}

                {selectedPeriod.entries.length === 0 && (
                  <p className="text-sm text-muted-color text-center py-3">{"אין פריטים עדיין"}</p>
                )}
              </div>
            </section>

            {/* Contact actions — only for OPEN/REOPENED. */}
            {isPeriodOpen(selectedPeriod.status) && (
              isUsablePhone(selectedPeriod.ownerPhone) ? (
                <section className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleWhatsApp(selectedPeriod)}
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-center transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
                      <Send size={18} />
                    </div>
                    <p className="text-sm font-semibold text-dark">{"תזכורת וואטסאפ"}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCall(selectedPeriod)}
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-center transition-transform active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                      <Phone size={18} />
                    </div>
                    <p className="text-sm font-semibold text-dark">{"התקשרות"}</p>
                  </button>
                </section>
              ) : (
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-center space-y-1">
                  <p className="text-sm font-semibold text-dark">
                    {"אין מספר טלפון של בעל הכלב"}
                  </p>
                  <p className="text-xs text-muted-color leading-relaxed">
                    {"אפשר לבקש ממנו להשלים בהגדרות"}
                  </p>
                </section>
              )
            )}

            <p className="text-xs text-center text-muted-color">
              {"רק בעל הכלב יכול לסמן חשבון כשולם."}
            </p>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
