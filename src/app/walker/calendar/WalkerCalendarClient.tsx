"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Clock, Footprints } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { WalkerCalendarData, CalendarWalk } from "./actions";

type Props = {
  data: WalkerCalendarData;
};

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WalkerCalendarClient({ data }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get today's date string
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // Calculate calendar grid
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(data.year, data.month - 1, 1);
    // In Hebrew calendar, Sunday is 0, Saturday is 6
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(data.year, data.month, 0).getDate();

    const grid: (number | null)[][] = [];
    let currentDay = 1;
    let week: (number | null)[] = [];

    // Fill empty cells before first day
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }

    // Fill days
    while (currentDay <= daysInMonth) {
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
      week.push(currentDay);
      currentDay++;
    }

    // Fill remaining cells
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);

    return grid;
  }, [data.year, data.month]);

  // Get walks for selected date
  const selectedDayWalks = useMemo(() => {
    if (!selectedDate) return [];
    return data.walks.filter((walk) => {
      const walkDate = new Date(walk.startTime);
      const walkDateStr = `${walkDate.getFullYear()}-${String(walkDate.getMonth() + 1).padStart(2, "0")}-${String(walkDate.getDate()).padStart(2, "0")}`;
      return walkDateStr === selectedDate;
    });
  }, [selectedDate, data.walks]);

  function getDayData(day: number) {
    const dateStr = `${data.year}-${String(data.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return data.days.find((d) => d.date === dateStr);
  }

  function navigateMonth(direction: "prev" | "next") {
    let newMonth = data.month + (direction === "next" ? 1 : -1);
    let newYear = data.year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    const monthStr = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    router.push(`/walker/calendar?month=${monthStr}`);
  }

  function handleDayClick(day: number) {
    const dateStr = `${data.year}-${String(data.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <TopBar name={data.userName} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Month Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="חודש הבא"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <h1 className="text-xl font-semibold text-foreground">
            {HEBREW_MONTHS[data.month - 1]} {data.year}
          </h1>
          
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="חודש קודם"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Calendar Grid */}
        <section className="bg-card rounded-2xl p-4 border border-border">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {HEBREW_DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="space-y-1">
            {calendarGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <div key={dayIndex} className="aspect-square" />;
                  }

                  const dayData = getDayData(day);
                  const dateStr = `${data.year}-${String(data.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const hasWalks = dayData && dayData.walkCount > 0;
                  const hasLive = dayData?.hasLive || dayData?.hasPlanned;

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-sm
                        ${isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-primary-light border-2 border-primary text-primary"
                          : "hover:bg-muted"
                        }
                      `}
                    >
                      <span className={`font-medium ${isSelected ? "" : "text-foreground"}`}>
                        {day}
                      </span>
                      {hasWalks && !isSelected && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {dayData.totalMinutes}׳
                          </span>
                        </div>
                      )}
                      {hasLive && !isSelected && (
                        <span className="text-[8px] font-bold text-accent">חי</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Selected Day Walks */}
        {selectedDate && (
          <section className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              טיולים ביום {new Date(selectedDate).toLocaleDateString("he-IL", { day: "numeric", month: "long" })}
            </h2>
            
            {selectedDayWalks.length === 0 ? (
              <div className="py-6 text-center">
                <Footprints className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">אין טיולים ביום זה</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayWalks.map((walk) => (
                  <WalkCard key={walk.id} walk={walk} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Monthly Summary */}
        {!selectedDate && (
          <section className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">סיכום חודשי</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{data.walks.length}</p>
                  <p className="text-xs text-muted-foreground">טיולים</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground font-mono">
                    {data.days.reduce((sum, d) => sum + d.totalMinutes, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">דקות</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav variant="walker" active="calendar" />
    </div>
  );
}

function WalkCard({ walk }: { walk: CalendarWalk }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground">{walk.dogName}</span>
          <StatusBadge status={walk.status} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(walk.startTime)}</span>
          {walk.endTime && (
            <>
              <span>-</span>
              <span>{formatTime(walk.endTime)}</span>
            </>
          )}
          {walk.durationMinutes && (
            <span className="font-mono">({walk.durationMinutes} דק׳)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{walk.ownerName}</p>
      </div>
    </div>
  );
}
