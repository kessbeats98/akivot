"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import { OwnerCalendarView } from "./OwnerCalendarView";
import { OwnerDayDetailsPanel } from "./OwnerDayDetailsPanel";
import { OwnerWalkListView } from "./OwnerWalkListView";

interface Props {
  walks: DogWalkHistoryItem[];
}

type Tab = "calendar" | "list";

export function OwnerHistorySection({ walks }: Props) {
  const [tab, setTab] = useState<Tab>("list");
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const handleNavigateMonth = (dir: -1 | 1) => {
    const d = new Date(month + "-01");
    d.setMonth(d.getMonth() + dir);
    setMonth(format(d, "yyyy-MM"));
    setSelectedDay(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab toggle */}
      <div className="flex gap-1 justify-end">
        <button
          onClick={() => setTab("calendar")}
          className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-colors ${
            tab === "calendar" ? "bg-white text-dark shadow-sm" : "text-gray-400"
          }`}
        >
          יומן
        </button>
        <button
          onClick={() => setTab("list")}
          className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-colors ${
            tab === "list" ? "bg-white text-dark shadow-sm" : "text-gray-400"
          }`}
        >
          רשימה
        </button>
      </div>

      {tab === "calendar" ? (
        <>
          <OwnerCalendarView
            walks={walks}
            month={month}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onNavigateMonth={handleNavigateMonth}
          />
          <OwnerDayDetailsPanel day={selectedDay} walks={walks} />
        </>
      ) : (
        <OwnerWalkListView walks={walks} />
      )}
    </div>
  );
}
