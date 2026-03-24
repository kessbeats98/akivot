"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  getDaysInMonth,
  getDay,
} from "date-fns";
import { he } from "date-fns/locale";
import type { CalendarWalk, WalkStatus } from "@/lib/services/walks/types";

interface Props {
  walks: CalendarWalk[];
  weekStart: string;
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

function formatTime(d: Date) {
  return format(new Date(d), "HH:mm");
}

export function WalkerCalendarClient({ walks, weekStart }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMonth, setShowMonth] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStartDate = new Date(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

  const navigateWeek = (direction: "prev" | "next") => {
    const newStart =
      direction === "prev"
        ? subWeeks(weekStartDate, 1)
        : addWeeks(weekStartDate, 1);
    router.push(`/walker/calendar?week=${format(newStart, "yyyy-MM-dd")}`);
  };

  const walksForDay = (day: Date) =>
    walks.filter((w) => isSameDay(new Date(w.startTime), day));

  const activeDay = selectedDay ?? days.find((d) => isToday(d)) ?? days[0];
  const activeDayWalks = activeDay ? walksForDay(activeDay) : [];

  // Month view data
  const monthDate = startOfMonth(weekStartDate);
  const firstDayOfMonth = getDay(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const monthCells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthDate, i)),
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-rounded text-brand text-2xl">calendar_month</span>
          <h1 className="text-xl font-bold text-dark">יומן טיולים</h1>
        </div>
        <button
          onClick={() => setShowMonth(!showMonth)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            showMonth
              ? "bg-brand text-white"
              : "bg-brand-light text-brand"
          }`}
        >
          {showMonth ? "תצוגת שבוע" : "יומן חודשי"}
        </button>
      </header>

      <main className="px-6">
        {showMonth ? (
          /* Month Grid View */
          <div className="bg-white rounded-[2rem] p-6 border border-brand/5 shadow-glass">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  const prev = new Date(monthDate);
                  prev.setMonth(prev.getMonth() - 1);
                  router.push(`/walker/calendar?week=${format(startOfWeek(prev, { weekStartsOn: 0 }), "yyyy-MM-dd")}`);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-rounded text-gray-500">chevron_right</span>
              </button>
              <span className="font-bold text-dark">
                {HEBREW_MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
              </span>
              <button
                onClick={() => {
                  const next = new Date(monthDate);
                  next.setMonth(next.getMonth() + 1);
                  router.push(`/walker/calendar?week=${format(startOfWeek(next, { weekStartsOn: 0 }), "yyyy-MM-dd")}`);
                }}
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
              {monthCells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />;
                const dayWalks = walksForDay(day);
                const today = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDay(day);
                      setShowMonth(false);
                      router.push(`/walker/calendar?week=${format(startOfWeek(day, { weekStartsOn: 0 }), "yyyy-MM-dd")}`);
                    }}
                    className="flex flex-col items-center h-12 justify-center"
                  >
                    <span
                      className={
                        today
                          ? "w-8 h-8 flex items-center justify-center rounded-full bg-brand text-white font-bold text-sm"
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
        ) : (
          /* Week View */
          <>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateWeek("prev")}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100"
              >
                <span className="material-symbols-rounded text-gray-500">chevron_right</span>
              </button>
              <span className="text-sm font-bold text-dark">
                {format(weekStartDate, "d MMM", { locale: he })} — {format(addDays(weekStartDate, 6), "d MMM yyyy", { locale: he })}
              </span>
              <button
                onClick={() => navigateWeek("next")}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100"
              >
                <span className="material-symbols-rounded text-gray-500">chevron_left</span>
              </button>
            </div>

            {/* Week Strip */}
            <div className="bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 mb-6">
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const dayWalks = walksForDay(day);
                  const today = isToday(day);
                  const selected = activeDay && isSameDay(day, activeDay);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center py-2 rounded-2xl transition-colors ${
                        selected
                          ? "bg-brand text-white"
                          : today
                          ? "bg-brand-light text-brand"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-[10px] font-medium mb-1 ${selected ? "text-white/80" : "text-gray-400"}`}>
                        {HEBREW_DAYS[i]}
                      </span>
                      <span className={`text-lg font-bold ${selected ? "" : "text-dark"}`}>
                        {day.getDate()}
                      </span>
                      {dayWalks.length > 0 && (
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${selected ? "bg-white" : "bg-brand"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day's Walks */}
            <div>
              <h3 className="font-bold text-lg text-dark mb-4">
                {activeDay && isToday(activeDay) ? "היום" : activeDay ? format(activeDay, "EEEE, d בMMMM", { locale: he }) : ""}
              </h3>

              {activeDayWalks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeDayWalks.map((walk) => {
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
                            <h4 className="font-bold text-dark">{walk.dogName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-numbers">
                            {formatTime(walk.startTime)}
                            {walk.endTime && ` — ${formatTime(walk.endTime)}`}
                            {walk.durationMinutes != null && (
                              <span className="mr-2">({walk.durationMinutes} דק')</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-brand/5 rounded-[2rem] p-8 flex flex-col items-center gap-2">
                  <span className="material-symbols-rounded text-brand/40 text-3xl">event_busy</span>
                  <p className="text-gray-500 text-sm">אין טיולים</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
