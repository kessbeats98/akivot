import { Menu, Bell, PawPrint, ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getWalkerBillingAction } from "./actions";
import type { PaymentPeriodWithEntries, PaymentEntry } from "@/lib/services/billing/types";

function WalkCard({
  entry,
  period,
}: {
  entry: PaymentEntry;
  period: PaymentPeriodWithEntries;
}) {
  const paid = period.status === "PAID";
  const date = new Date(entry.createdAt);
  const timeStr = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
      {/* Dog avatar */}
      <div className="w-12 h-12 rounded-full bg-[#2A9D8F] flex items-center justify-center flex-shrink-0">
        <PawPrint size={22} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-neutral-800 text-sm truncate">טיול</p>
        <p className="text-xs text-neutral-400">
          {dateStr} · {timeStr}
        </p>
        <p className="text-xs font-semibold text-[#2A9D8F] mt-0.5">
          ₪{entry.amount}
        </p>
      </div>

      {/* Badge + link */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            paid
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {paid ? "שולם" : "לא שולם"}
        </span>
        <button className="flex items-center gap-0.5 text-xs text-[#2A9D8F] font-medium">
          פרטים <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
}

export default async function WalkerBillingPage() {
  const { periods } = await getWalkerBillingAction();

  // Flat list of WALK entries with their parent period
  const rows: { entry: PaymentEntry; period: PaymentPeriodWithEntries }[] = [];
  for (const period of periods) {
    for (const entry of period.entries) {
      if (entry.entryType === "WALK") {
        rows.push({ entry, period });
      }
    }
  }
  // Newest first
  rows.sort((a, b) => b.entry.createdAt.getTime() - a.entry.createdAt.getTime());

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 pt-10 pb-4 bg-[#FAF9F6]/80 backdrop-blur border-b border-[#2A9D8F]/10">
        <Menu size={24} className="text-neutral-600" />
        <h1 className="text-base font-bold text-neutral-800">רשימת פסיעות</h1>
        <div className="relative">
          <Bell size={22} className="text-neutral-600" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 px-6 mt-4 border-b border-slate-200">
        <button className="pb-2 text-sm font-bold text-[#2A9D8F] border-b-2 border-[#2A9D8F]">
          מה שהיה
        </button>
        <button className="pb-2 text-sm text-slate-400">מה שיהיה</button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto">
        {["הכל", "10 דק'", "20 דק'", "30 דק'"].map((label, i) => (
          <span
            key={label}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border ${
              i === 0
                ? "bg-[#2A9D8F] text-white border-transparent"
                : "bg-[#2A9D8F]/10 text-[#2A9D8F] border-[#2A9D8F]/20"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Walk list */}
      <main className="flex-1 px-6 pb-28 space-y-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PawPrint size={40} className="text-[#2A9D8F]/30" />
            <p className="text-neutral-400 text-sm">אין טיולים עדיין</p>
          </div>
        ) : (
          rows.map(({ entry, period }) => (
            <WalkCard key={entry.id} entry={entry} period={period} />
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
