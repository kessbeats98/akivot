"use client";

import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import type { WalkStatus } from "@/lib/services/walks/types";

interface Props {
  walks: DogWalkHistoryItem[];
}

const STATUS_BADGE: Record<WalkStatus, { label: string; cls: string }> = {
  PLANNED: { label: "מתוכנן", cls: "bg-gray-100 text-gray-600" },
  LIVE: { label: "בטיול", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "הושלם", cls: "bg-brand-light text-brand" },
  AUTO_CLOSED: { label: "נסגר", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "בוטל", cls: "bg-red-100 text-red-600" },
};

type FilterKey = "all" | "completed" | "planned" | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "completed", label: "הושלם" },
  { key: "planned", label: "מתוכנן" },
  { key: "cancelled", label: "בוטל" },
];

function applyFilter(walks: DogWalkHistoryItem[], filter: FilterKey): DogWalkHistoryItem[] {
  if (filter === "completed") return walks.filter((w) => w.status === "COMPLETED" || w.status === "AUTO_CLOSED");
  if (filter === "planned") return walks.filter((w) => w.status === "PLANNED");
  if (filter === "cancelled") return walks.filter((w) => w.status === "CANCELLED");
  return walks;
}

export function OwnerWalkListView({ walks }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = applyFilter(walks, filter);

  return (
    <div className="flex flex-col gap-4">
      {walks.length >= 5 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-gray-800/10 text-gray-800"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-brand/5 rounded-[2rem] p-6 flex flex-col items-center gap-2">
          <span className="material-symbols-rounded text-brand/30 text-3xl">inbox</span>
          <p className="text-sm text-gray-400">אין טיולים בקטגוריה זו</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((walk) => {
            const badge = STATUS_BADGE[walk.status];
            const dateLabel = format(new Date(walk.startTime), "d בMMM", { locale: he });
            const startLabel = format(new Date(walk.startTime), "HH:mm");
            return (
              <div
                key={walk.id}
                className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-dark">{dateLabel}</span>
                    <span className="font-numbers text-xs text-gray-400">{startLabel}</span>
                    {walk.note && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-rounded text-gray-400 text-xs">directions_walk</span>
                    <span className="text-xs text-gray-500">{walk.walkerName}</span>
                    {walk.durationMinutes != null && (
                      <span className="font-numbers text-xs text-gray-400 mr-1">· {walk.durationMinutes} דק'</span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
