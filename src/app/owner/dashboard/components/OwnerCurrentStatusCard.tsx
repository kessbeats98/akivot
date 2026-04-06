"use client";

import { useState, useEffect } from "react";
import type { ActiveLiveWalk } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";

interface Props {
  dogName: string;
  liveWalk: ActiveLiveWalk | null;
  lastCompletedWalk: DogWalkHistoryItem | null;
  hasActiveWalker?: boolean;
}

const pad = (n: number) => n.toString().padStart(2, "0");

function LiveTimer({ startTime }: { startTime: string | Date }) {
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)),
  );
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return <span>{pad(h)}:{pad(m)}:{pad(s)}</span>;
}

export function OwnerCurrentStatusCard({ dogName, liveWalk, lastCompletedWalk, hasActiveWalker }: Props) {
  // Walking state — matches HTML .status-card.walking
  if (liveWalk) {
    const startLabel = new Date(liveWalk.startTime).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="rounded-[28px] px-7 py-8 text-center relative overflow-hidden bg-brand-dark text-white">
        {/* Decorative */}
        <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-white/[0.06] rounded-full" />

        <div className="flex items-center justify-center gap-2.5 mb-4 relative z-10">
          <div className="w-3 h-3 rounded-full bg-[#4ade80] animate-live-pulse" />
          <span className="text-[15px] font-semibold opacity-85">בטיול עכשיו</span>
        </div>

        <div className="font-numbers text-[64px] font-extrabold tracking-[-3px] leading-none mb-2 relative z-10">
          <LiveTimer startTime={liveWalk.startTime} />
        </div>

        <div className="text-[15px] opacity-75 mb-5 relative z-10">
          התחיל ב-{startLabel}
        </div>

        {/* Walker info */}
        <div className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white/[0.12] rounded-2xl relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
            {liveWalk.walkerName.charAt(0)}
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">עם המוביל</div>
            <div className="text-[15px] font-bold">{liveWalk.walkerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // Walk just ended — matches HTML screen-ended
  if (lastCompletedWalk) {
    const recentThreshold = 60 * 60 * 1000; // 1 hour
    const endedRecently =
      lastCompletedWalk.endTime &&
      Date.now() - new Date(lastCompletedWalk.endTime).getTime() < recentThreshold;

    if (endedRecently) {
      return (
        <div className="rounded-[28px] px-7 py-8 text-center relative overflow-hidden bg-brand-light border border-[#86efac]">
          <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-white/[0.06] rounded-full" />

          <div className="flex items-center justify-center gap-2.5 mb-4 relative z-10">
            <div className="w-3 h-3 rounded-full bg-brand" />
            <span className="text-[15px] font-semibold text-brand-dark">הטיול הסתיים</span>
          </div>

          <div className="text-5xl font-extrabold text-brand-dark mb-2 relative z-10">✓</div>

          <div className="text-[15px] text-brand-dark mb-5 relative z-10">
            {lastCompletedWalk.durationMinutes} דקות • הסתיים עכשיו
          </div>

          {lastCompletedWalk.walkerName && (
            <div className="flex items-center justify-center gap-3 px-5 py-3.5 bg-[rgba(22,101,52,0.1)] rounded-2xl relative z-10">
              <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center font-bold text-base">
                {lastCompletedWalk.walkerName.charAt(0)}
              </div>
              <div className="text-right text-brand-dark">
                <div className="text-xs opacity-70">היה עם</div>
                <div className="text-[15px] font-bold">{lastCompletedWalk.walkerName}</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Home state with history — matches HTML .status-card.home
    return (
      <div className="rounded-[28px] px-7 py-8 text-center relative overflow-hidden bg-stone100 border border-[var(--border)]">
        <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-white/[0.06] rounded-full" />

        <div className="flex items-center justify-center gap-2.5 mb-4 relative z-10">
          <div className="w-3 h-3 rounded-full bg-muted-color" />
          <span className="text-[15px] font-semibold text-muted-color">בבית</span>
        </div>

        <div className="text-5xl font-extrabold text-dark mb-2 relative z-10">🏠</div>

        <div className="text-[15px] text-muted-color mb-5 relative z-10">
          {dogName} נח בבית
        </div>

        {lastCompletedWalk.walkerName && (
          <div className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-[var(--border)] rounded-2xl relative z-10">
            <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-base">
              {lastCompletedWalk.walkerName.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-color">עם המוביל</div>
              <div className="text-[15px] font-bold text-dark">{lastCompletedWalk.walkerName}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // New user, no walks — matches HTML screen-new
  // No walker: amber tint (matches assign-walker CTA palette)
  // Walker assigned but no walks yet: neutral stone
  if (!hasActiveWalker) {
    return (
      <div className="rounded-[28px] px-7 py-10 text-center relative overflow-hidden bg-amber-50 border border-amber-200">
        <div className="text-[56px] mb-4">🐾</div>
        <div className="text-xl font-bold text-dark mb-2">אין טיול מתוכנן</div>
        <div className="text-[15px] text-muted-color">שייך מוביל כדי להתחיל</div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] px-7 py-10 text-center relative overflow-hidden bg-stone100 border border-[var(--border)]">
      <div className="text-[56px] mb-4">🐾</div>
      <div className="text-xl font-bold text-dark mb-2">אין טיול מתוכנן</div>
      <div className="text-[15px] text-muted-color">כשתהיה הליכה — תראה אותה כאן</div>
    </div>
  );
}
