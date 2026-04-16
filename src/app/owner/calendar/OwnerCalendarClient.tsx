"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  startOfMonth,
  getDaysInMonth,
  getDay,
  addDays,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { he } from "date-fns/locale";
import type { OwnerCalendarWalk, WalkStatus } from "@/lib/services/walks/types";

interface Props {
  walks: OwnerCalendarWalk[];
  month: string; // YYYY-MM
}

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const STATUS_BADGE: Record<WalkStatus, { label: string; cls: string }> = {
  PLANNED: { label: "מתוכנן", cls: "bg-gray-100 text-gray-600" },
  LIVE: { label: "בטיול", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "הושלם", cls: "bg-brand-light text-brand" },
  AUTO_CLOSED: { label: "נסגר", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "בוטל", cls: "bg-red-100 text-red-600" },
};

export function OwnerCalendarClient({ walks, month }: Props) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthDate = startOfMonth(new Date(month + "-01"));
  const firstDayOfMonth = getDay(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const cells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthDate, i)),
  ];

  const walksForDay = (day: Date) =>
    walks.filter((w) => isSameDay(new Date(w.startTime), day));

  const selectedWalks = selectedDay ? walksForDay(selectedDay) : [];

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + dir);
    router.push(`/owner/calendar?month=${format(d, "yyyy-MM")}`);
  };

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <Link href="/owner/dashboard" className="inline-flex items-center gap-1 text-brand/60 text-sm font-medium mb-3 hover:text-brand transition-colors">
          <span className="material-symbols-rounded text-base">arrow_forward</span>
          בית
        </Link>
        <div className="flex items-center gap-3">
          <span className="material-symbols-rounded text-brand text-2xl">calendar_month</span>
          <h1 className="text-xl font-bold text-dark">יומן הטיולים</h1>
        </div>
      </header>

      <main className="px-6">
        {/* Calendar Grid */}
        <div className="bg-white rounded-[2rem] p-6 border border-brand/5 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-rounded text-gray-500">chevron_right</span>
            </button>
            <span className="font-bold text-dark">
              {HEBREW_MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-rounded text-gray-500">chevron_left</span>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {HEBREW_DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-3">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const dayWalks = walksForDay(day);
              const today = isToday(day);
              const selected = selectedDay && isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center h-12 justify-center"
                >
                  <span
                    className={
                      selected
                        ? "w-8 h-8 flex items-center justify-center rounded-full bg-brand text-white font-bold text-sm"
                        : today
                        ? "w-8 h-8 flex items-center justify-center rounded-full bg-brand-light text-brand font-bold text-sm"
                        : "text-dark/70 text-sm"
                    }
                  >
                    {day.getDate()}
                  </span>
                  {dayWalks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayWalks.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Walks */}
        <div className="mt-6">
          <h3 className="font-bold text-lg text-dark mb-4">
            {selectedDay
              ? format(selectedDay, "EEEE, d בMMMM", { locale: he })
              : "בחר יום לצפייה בטיולים"}
          </h3>

          {selectedDay && selectedWalks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {selectedWalks.map((walk) => {
                const badge = STATUS_BADGE[walk.status];
                return (
                  <div
                    key={walk.id}
                    className="bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
                      <span className="font-bold text-lg">{walk.dogName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-dark text-sm">{walk.dogName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        <span className="material-symbols-rounded text-[12px] align-middle ml-0.5">directions_walk</span>
                        {walk.walkerName}
                        <span className="font-numbers mr-2">
                          {format(new Date(walk.startTime), "HH:mm")}
                          {walk.endTime && ` — ${format(new Date(walk.endTime), "HH:mm")}`}
                        </span>
                        {walk.durationMinutes != null && (
                          <span className="font-numbers">({walk.durationMinutes} דק')</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedDay ? (
            <div className="bg-brand/5 rounded-[2rem] p-8 flex flex-col items-center gap-2">
              <span className="material-symbols-rounded text-brand/40 text-3xl">event_busy</span>
              <p className="text-gray-500 text-sm">אין טיולים ביום הזה</p>
            </div>
          ) : (
            <div className="bg-brand/5 rounded-[2rem] p-8 flex flex-col items-center gap-2">
              <span className="material-symbols-rounded text-brand/40 text-3xl">touch_app</span>
              <p className="text-gray-500 text-sm">לחץ על יום ביומן לצפייה בטיולים</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
