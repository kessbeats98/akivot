"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addWeeks,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { he } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarWalk, WalkStatus } from "@/lib/services/walks/types";

interface Props {
  walks: CalendarWalk[];
  weekStart: string;
}

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const STATUS_BADGE: Record<WalkStatus, { label: string; cls: string }> = {
  PLANNED: { label: "מתוכנן", cls: "bg-gray-100 text-gray-600" },
  LIVE: { label: "בטיול", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "הושלם", cls: "bg-brand-light text-brand" },
  AUTO_CLOSED: { label: "נסגר", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "בוטל", cls: "bg-red-100 text-red-600" },
};

function formatTime(date: Date) {
  return format(new Date(date), "HH:mm");
}

export function WalkerCalendarSurface({ walks, weekStart }: Props) {
  const router = useRouter();
  const [showMonth, setShowMonth] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStartDate = new Date(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStartDate, index));

  const navigateWeek = (direction: "prev" | "next") => {
    const nextStart = direction === "prev" ? subWeeks(weekStartDate, 1) : addWeeks(weekStartDate, 1);
    router.push(`/walker/calendar?week=${format(nextStart, "yyyy-MM-dd")}`);
  };

  const walksForDay = (day: Date) =>
    walks.filter((walk) => isSameDay(new Date(walk.startTime), day));

  const activeDay = selectedDay ?? days.find((day) => isToday(day)) ?? days[0]!;
  const activeDayWalks = walksForDay(activeDay);

  const monthDate = startOfMonth(weekStartDate);
  const firstDayOfMonth = getDay(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const monthCells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => addDays(monthDate, index)),
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <Link
          href="/walker/dashboard"
          className="inline-flex items-center gap-1 text-brand/60 text-sm font-medium mb-3 hover:text-brand transition-colors"
        >
          <span className="material-symbols-rounded text-base">arrow_forward</span>
          בית
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand/70 mb-1">תכנון</p>
            <h1 className="text-xl font-semibold text-dark tracking-tight">יומן הטיולים</h1>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <section className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowMonth(false)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                showMonth ? "bg-surface text-muted-color" : "bg-brand text-white"
              }`}
            >
              שבוע
            </button>
            <button
              type="button"
              onClick={() => setShowMonth(true)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                showMonth ? "bg-brand text-white" : "bg-surface text-muted-color"
              }`}
            >
              חודש
            </button>
          </div>
        </section>

        {showMonth ? (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => {
                  const previousMonth = new Date(monthDate);
                  previousMonth.setMonth(previousMonth.getMonth() - 1);
                  router.push(
                    `/walker/calendar?week=${format(startOfWeek(previousMonth, { weekStartsOn: 0 }), "yyyy-MM-dd")}`,
                  );
                }}
                className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-500"
                aria-label="חודש קודם"
              >
                <ChevronRight size={16} />
              </button>

              <span className="text-sm font-semibold text-dark">
                {HEBREW_MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
              </span>

              <button
                type="button"
                onClick={() => {
                  const nextMonth = new Date(monthDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  router.push(
                    `/walker/calendar?week=${format(startOfWeek(nextMonth, { weekStartsOn: 0 }), "yyyy-MM-dd")}`,
                  );
                }}
                className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-500"
                aria-label="חודש הבא"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {HEBREW_DAYS.map((day) => (
                <div key={day} className="text-center text-xs text-muted-color font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-3">
              {monthCells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;

                const dayWalks = walksForDay(day);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      setShowMonth(false);
                      router.push(
                        `/walker/calendar?week=${format(startOfWeek(day, { weekStartsOn: 0 }), "yyyy-MM-dd")}`,
                      );
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
                        {dayWalks.slice(0, 3).map((_, dotIndex) => (
                          <div key={dotIndex} className="w-1.5 h-1.5 rounded-full bg-brand" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateWeek("prev")}
                className="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-500"
                aria-label="שבוע קודם"
              >
                <ChevronRight size={16} />
              </button>

              <span className="text-sm font-semibold text-dark">
                {format(weekStartDate, "d MMM", { locale: he })} - {format(addDays(weekStartDate, 6), "d MMM yyyy", { locale: he })}
              </span>

              <button
                type="button"
                onClick={() => navigateWeek("next")}
                className="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-500"
                aria-label="שבוע הבא"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayWalks = walksForDay(day);
                  const today = isToday(day);
                  const selected = isSameDay(day, activeDay);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center py-2 rounded-2xl transition-colors ${
                        selected
                          ? "bg-brand text-white"
                          : today
                            ? "bg-brand-light text-brand"
                            : "hover:bg-surface"
                      }`}
                    >
                      <span className={`text-[10px] font-medium mb-1 ${selected ? "text-white/80" : "text-muted-color"}`}>
                        {HEBREW_DAYS[index]}
                      </span>
                      <span className={`text-base font-bold ${selected ? "" : "text-dark"}`}>
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
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-dark">
              {isToday(activeDay)
                ? "היום"
                : format(activeDay, "EEEE, d בMMMM", { locale: he })}
            </h2>
            <span className="text-xs text-muted-color">{activeDayWalks.length} טיולים</span>
          </div>

          {activeDayWalks.length > 0 ? (
            <div className="space-y-3">
              {activeDayWalks.map((walk) => {
                const badge = STATUS_BADGE[walk.status];

                return (
                  <div
                    key={walk.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold">{walk.dogName.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-dark truncate">{walk.dogName}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs text-muted-color font-numbers">
                        {formatTime(walk.startTime)}
                        {walk.endTime && ` - ${formatTime(walk.endTime)}`}
                        {walk.durationMinutes != null && <span className="mr-2">({walk.durationMinutes} דק')</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <span className="material-symbols-rounded text-brand/40 text-3xl">event_busy</span>
              <p className="text-sm text-muted-color mt-2">אין טיולים ביום הזה</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
