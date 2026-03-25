"use client";

import {
  startOfMonth,
  getDaysInMonth,
  getDay,
  addDays,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import type { WalkStatus } from "@/lib/services/walks/types";

interface Props {
  walks: DogWalkHistoryItem[];
  month: string; // YYYY-MM
  selectedDay: Date | null;
  onSelectDay: (d: Date) => void;
  onNavigateMonth: (dir: -1 | 1) => void;
}

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const STATUS_PRIORITY: WalkStatus[] = ["LIVE", "COMPLETED", "AUTO_CLOSED", "PLANNED", "CANCELLED"];

function dominantStatus(statuses: WalkStatus[]): WalkStatus | null {
  for (const s of STATUS_PRIORITY) {
    if (statuses.includes(s)) return s;
  }
  return null;
}

function DayDot({ status }: { status: WalkStatus }) {
  if (status === "LIVE") {
    return <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />;
  }
  if (status === "COMPLETED" || status === "AUTO_CLOSED") {
    return <div className="w-1.5 h-1.5 rounded-full bg-brand" />;
  }
  if (status === "PLANNED") {
    return <div className="w-1.5 h-1.5 rounded-full border-2 border-brand/40 bg-transparent" />;
  }
  return <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />;
}

export function OwnerCalendarView({ walks, month, selectedDay, onSelectDay, onNavigateMonth }: Props) {
  const monthDate = startOfMonth(new Date(month + "-01"));
  const firstDayOfMonth = getDay(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const cells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthDate, i)),
  ];

  const walksForDay = (day: Date) =>
    walks.filter((w) => isSameDay(new Date(w.startTime), day));

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-brand/5 shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigateMonth(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <span className="material-symbols-rounded text-gray-500">chevron_right</span>
        </button>
        <span className="font-bold text-dark">
          {HEBREW_MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </span>
        <button
          onClick={() => onNavigateMonth(1)}
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
          const dominant = dominantStatus(dayWalks.map((w) => w.status));
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
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
                {format(day, "d")}
              </span>
              {dominant && (
                <div className="mt-0.5">
                  <DayDot status={dominant} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
