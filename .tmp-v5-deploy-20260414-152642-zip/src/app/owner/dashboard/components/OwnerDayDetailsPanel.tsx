"use client";

import { format, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import type { WalkStatus } from "@/lib/services/walks/types";

interface Props {
  day: Date | null;
  walks: DogWalkHistoryItem[];
}

const STATUS_BADGE: Record<WalkStatus, { label: string; cls: string }> = {
  PLANNED: { label: "מתוכנן", cls: "bg-gray-100 text-gray-600" },
  LIVE: { label: "בטיול", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "הושלם", cls: "bg-brand-light text-brand" },
  AUTO_CLOSED: { label: "נסגר", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "בוטל", cls: "bg-red-100 text-red-600" },
};

export function OwnerDayDetailsPanel({ day, walks }: Props) {
  if (!day) return null;

  const dayWalks = walks.filter((w) => isSameDay(new Date(w.startTime), day));
  const dayLabel = format(day, "EEEE, d בMMMM", { locale: he });

  return (
    <div className="mt-4">
      <h3 className="font-bold text-sm text-dark mb-3">{dayLabel}</h3>
      {dayWalks.length === 0 ? (
        <div className="bg-brand/5 rounded-[2rem] p-6 flex flex-col items-center gap-2">
          <span className="material-symbols-rounded text-brand/30 text-3xl">event_busy</span>
          <p className="text-sm text-gray-400">אין טיולים ביום הזה</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dayWalks.map((walk) => {
            const badge = STATUS_BADGE[walk.status];
            const startLabel = format(new Date(walk.startTime), "HH:mm");
            const endLabel = walk.endTime ? format(new Date(walk.endTime), "HH:mm") : null;
            const firstPhoto = walk.mediaPhotos[0];
            return (
              <div
                key={walk.id}
                className="bg-white rounded-2xl p-4 shadow-glass border border-white/60 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-numbers text-gray-500">
                    {startLabel}{endLabel ? ` — ${endLabel}` : ""}
                    {walk.durationMinutes != null && ` · ${walk.durationMinutes} דק'`}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-gray-400 text-sm">directions_walk</span>
                  <span className="text-xs text-gray-500">{walk.walkerName}</span>
                </div>
                {walk.note && (
                  <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-800">
                    {walk.note}
                  </div>
                )}
                {firstPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/walk-photo?key=${encodeURIComponent(firstPhoto.storageKey)}`}
                    alt="תמונה מהטיול"
                    className="w-full h-28 object-cover rounded-xl"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
