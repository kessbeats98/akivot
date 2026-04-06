"use client";

import { useState } from "react";
import { PawPrint, ChevronLeft, ChevronDown, X, Clock, CheckCircle, XCircle } from "lucide-react";
import type { PaymentEntry, PaymentPeriodWithEntries } from "@/lib/services/billing/types";

type Row = { entry: PaymentEntry; period: PaymentPeriodWithEntries };

function WalkDetailModal({
  row,
  onClose,
}: {
  row: Row;
  onClose: () => void;
}) {
  const { entry, period } = row;
  const paid = period.status === "PAID";
  const date = new Date(entry.createdAt);
  const timeStr = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl border-2 border-[#2A9D8F] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dog photo header */}
        <div className="h-40 w-full bg-[#2A9D8F]/10 relative flex items-center justify-center">
          <PawPrint size={64} className="text-[#2A9D8F]/30" />
          <button
            onClick={onClose}
            className="absolute top-3 left-3 bg-white/80 rounded-full p-1 shadow-sm"
          >
            <X size={18} className="text-[#1e2928]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2A9D8F]">טיול</p>
            <p className="text-[#678380] text-sm font-medium mt-1">{dateStr} · {timeStr}</p>
          </div>

          {/* Data grid 2-col */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2A9D8F]/5 rounded-xl p-3 flex flex-col items-center border border-[#2A9D8F]/10 gap-1.5">
              <Clock size={18} className="text-[#2A9D8F]" />
              <p className="text-xs text-[#678380]">משך זמן</p>
              <p className="font-bold text-[#1e2928] text-sm">—</p>
            </div>
            <div
              className={`rounded-xl p-3 flex flex-col items-center gap-1.5 ${
                paid ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
              }`}
            >
              {paid ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
              <p className="text-xs text-[#678380]">תשלום</p>
              <p className={`font-bold text-sm ${paid ? "text-green-600" : "text-red-500"}`}>
                {paid ? "שולם" : "לא שולם"}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-[#2A9D8F]/5 rounded-xl p-3 flex items-center justify-between border border-[#2A9D8F]/10">
            <span className="text-sm text-[#678380]">סכום</span>
            <span className="font-bold text-[#1e2928]">₪{entry.amount}</span>
          </div>

          {/* Note */}
          <div className="flex gap-3">
            <PawPrint size={18} className="text-[#2A9D8F]/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#1e2928]">הערה מהדרך</p>
              <p className="text-xs text-[#678380] italic mt-0.5">אין הערות לטיול זה</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full bg-[#2A9D8F] text-white font-bold py-3 rounded-full shadow-lg shadow-[#2A9D8F]/20 hover:brightness-110 transition-all"
          >
            סגור פרטים
          </button>
        </div>
      </div>
    </div>
  );
}

function WalkCard({
  entry,
  period,
  onDetails,
}: {
  entry: PaymentEntry;
  period: PaymentPeriodWithEntries;
  onDetails: () => void;
}) {
  const paid = period.status === "PAID";
  const date = new Date(entry.createdAt);
  const timeStr = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
      {/* Dog avatar */}
      <div className="w-20 h-20 rounded-xl bg-[#2A9D8F] flex items-center justify-center flex-shrink-0">
        <PawPrint size={32} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-lg text-[#1e2928] leading-tight">טיול</p>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
              paid
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {paid ? "שולם" : "לא שולם"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {dateStr} · {timeStr}
        </p>
        <button
          onClick={onDetails}
          className="text-[#2A9D8F] text-xs font-bold flex items-center gap-1 self-start mt-2"
        >
          פרטים <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
}

const FILTER_LABELS = ["הכל", "10 דק'", "20 דק'", "30 דק'"];

export function BillingList({ rows }: { rows: Row[] }) {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <>
      {/* Filter pills */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto">
        {FILTER_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveFilter(i)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1 ${
              i === activeFilter
                ? "bg-[#2A9D8F] text-white border-transparent"
                : "bg-[#2A9D8F]/10 text-[#2A9D8F] border-[#2A9D8F]/20"
            }`}
          >
            {label}
            {i !== activeFilter && <ChevronDown size={14} />}
          </button>
        ))}
      </div>

      {/* Walk list */}
      <div className="flex-1 px-6 pb-28 space-y-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PawPrint size={40} className="text-[#2A9D8F]/30" />
            <p className="text-[#678380] text-sm">אין טיולים עדיין</p>
          </div>
        ) : (
          rows.map(({ entry, period }) => (
            <WalkCard
              key={entry.id}
              entry={entry}
              period={period}
              onDetails={() => setSelectedRow({ entry, period })}
            />
          ))
        )}
      </div>

      {selectedRow && (
        <WalkDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </>
  );
}
