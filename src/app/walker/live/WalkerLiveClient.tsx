"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { differenceInSeconds } from "date-fns";
import { SlideOver } from "@/components/ui/slide-over";
import { getActionError } from "@/lib/action-utils";
import { checkWalkStatusAction } from "./actions";
import { useDebugMode } from "@/lib/hooks/useDebugMode";
import { DebugPanel } from "@/components/DebugPanel";
import { resetTestDataAction } from "@/app/dev/actions";

interface Props {
  walkId: string;
  dogName: string;
  startTime: string; // ISO string
  endWalkAction: (walkId: string, formData: FormData) => Promise<void>;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const WARN_MINUTES = 90;
const LONG_MINUTES = 105;

export function WalkerLiveClient({ walkId, dogName, startTime, endWalkAction }: Props) {
  const startDate = new Date(startTime);
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.max(0, differenceInSeconds(new Date(), startDate)),
  );
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [walkEnded, setWalkEnded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debug = useDebugMode();

  // Register __akivotReset so test cleanup works from the live page
  useEffect(() => {
    if (!debug.enabled) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__akivotReset = async () => {
      await resetTestDataAction();
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { delete (window as any).__akivotReset; };
  }, [debug.enabled]);

  // Online/offline detection
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    console.log("[walker/live] mounted", { walkId, dogName, startTime });
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, differenceInSeconds(new Date(), startDate)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate, walkId, dogName, startTime]);

  // On tab focus: correct timer + check if walk is still LIVE
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      setElapsedSeconds(Math.max(0, differenceInSeconds(new Date(), startDate)));
      try {
        // Debug override: simulate a forced walk status
        const { status } = debug.forceWalkStatus
          ? { status: debug.forceWalkStatus }
          : await checkWalkStatusAction(walkId);
        if (status !== "LIVE") {
          console.log("[walker/live] walk no longer LIVE, status:", status);
          setWalkEnded(true);
          setTimeout(() => {
            window.location.href = "/walker/dashboard?reason=auto_closed";
          }, 2500);
        }
      } catch {
        // Network error — timer already corrected, ignore
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [walkId, startDate, debug.forceWalkStatus]);

  const displayElapsed = elapsedSeconds + debug.timeOffset;
  const hours = Math.floor(displayElapsed / 3600);
  const minutes = Math.floor((displayElapsed % 3600) / 60);
  const seconds = displayElapsed % 60;
  const timerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const elapsedMinutes = Math.floor(displayElapsed / 60);
  const isWarning = elapsedMinutes >= WARN_MINUTES;
  const isLong = elapsedMinutes >= LONG_MINUTES;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploading) return;
    setIsUploading(true);
    setUploadError(null);
    console.log("[walker/live] uploading photo", { walkId, fileName: file.name, size: file.size });
    try {
      const formData = new FormData();
      formData.append("walkId", walkId);
      formData.append("capturedAt", new Date().toISOString());
      formData.append("file", file);
      const res = await fetch("/api/uploads/walk-media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        setPhotos((prev) => [url, ...prev]);
        console.log("[walker/live] photo uploaded successfully");
      } else {
        const text = await res.text().catch(() => "");
        console.error("[walker/live] photo upload HTTP error:", res.status, text);
        setUploadError(`שגיאה בהעלאת תמונה (${res.status})`);
      }
    } catch (err) {
      console.error("[walker/live] photo upload network error:", err);
      setUploadError("שגיאת חיבור — התמונה לא הועלתה");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const effectiveOffline = isOffline || debug.forceOffline;

  const handleFinishWalk = useCallback(async () => {
    if (isEnding) return; // double-end guard
    if (!navigator.onLine || debug.forceOffline) {
      setError("אין חיבור לאינטרנט — נסה שוב כשיש חיבור");
      return;
    }
    setIsEnding(true);
    setError(null);
    console.log("[walker/live] ending walk", { walkId, hasNote: !!note });
    try {
      const fd = new FormData();
      if (note.trim()) fd.append("note", note.trim());
      await endWalkAction(walkId, fd);
      console.log("[walker/live] walk ended — redirecting to /walker/dashboard");
    } catch (err) {
      const msg = getActionError(err, { action: "endWalk", walkId });
      setError(msg);
      setIsEnding(false);
    }
  }, [walkId, isEnding, endWalkAction, debug.forceOffline, note]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Topbar */}
      <div className="px-5 pt-[52px] pb-3.5 flex items-center justify-between flex-shrink-0">
        <div className="text-[15px] text-muted-color">
          בהליכה עם <b className="text-dark font-bold">{dogName}</b>
        </div>
        <div className="text-xl font-extrabold text-brand tracking-tight">עקבות</div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-[100px] flex flex-col gap-3 overflow-y-auto">
        {/* Offline indicator */}
        {effectiveOffline && (
          <div className="bg-stone100 border border-[var(--border)] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
            <div className="text-[13px] text-muted-color">אין חיבור לאינטרנט</div>
          </div>
        )}

        {/* Walk ended (auto-close or external) */}
        {walkEnded && (
          <div className="bg-brand-light border border-[#86efac] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
            <div className="text-lg flex-shrink-0">✓</div>
            <div className="text-[13px] font-semibold text-brand-dark">הטיול הסתיים. חוזרים לדף הבית...</div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <button
            onClick={() => setError(null)}
            className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[14px] px-4 py-3 flex items-center gap-2.5 w-full text-right"
          >
            <div className="text-lg flex-shrink-0">⚠️</div>
            <div className="flex-1 text-[13px] font-semibold text-[#991b1b]">{error}</div>
            <div className="text-xs text-[#991b1b] opacity-60 flex-shrink-0">✕</div>
          </button>
        )}

        {/* Long walk banner */}
        {isLong && (
          <div className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[14px] px-4 py-3 flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[#991b1b]">
              שכחת לסיים? ההליכה ארוכה מאוד
            </div>
            <button
              onClick={() => setIsFinishOpen(true)}
              disabled={isEnding}
              className="bg-[var(--red)] text-white border-none rounded-[10px] px-3.5 py-2 text-[13px] font-bold cursor-pointer disabled:opacity-50"
            >
              סיים עכשיו
            </button>
          </div>
        )}

        {/* Warning banner (90-105 min) */}
        {isWarning && !isLong && (
          <div className="bg-[var(--amber-mid)] border border-[#fbbf24] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
            <div className="text-lg">⚠️</div>
            <div className="text-[13px] font-semibold text-[#92400e]">
              ההליכה ארוכה — שקול לסיים בקרוב
            </div>
          </div>
        )}

        {/* Live card */}
        <div className="bg-brand-dark rounded-3xl px-[22px] pt-6 pb-5 text-white relative overflow-hidden">
          <div className="absolute -top-[60px] -left-[60px] w-[220px] h-[220px] bg-white/[0.04] rounded-full" />

          <div className="flex items-center gap-2 mb-3.5 relative z-10">
            <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-full animate-live-pulse" />
            <span className="text-[13px] font-semibold opacity-85">בהליכה עכשיו</span>
          </div>

          <div className={`font-numbers text-[56px] font-bold tracking-[-2px] leading-none mb-3.5 relative z-10 ${isWarning ? "text-[#fca5a5]" : ""}`}>
            {timerText}
          </div>

          <div className="flex gap-2 flex-wrap mb-5 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/[0.12] px-3.5 py-1.5 rounded-[20px] text-sm font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              {dogName}
            </div>
          </div>

          <button
            data-testid="end-walk"
            onClick={() => setIsFinishOpen(true)}
            disabled={isEnding}
            className="w-full border-none rounded-2xl py-4 font-bold text-[17px] cursor-pointer flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98] bg-amber text-white relative z-10 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            {isEnding ? "מסיים..." : "סיים הליכה"}
          </button>
        </div>

        {/* Upload error */}
        {uploadError && (
          <button
            onClick={() => setUploadError(null)}
            className="bg-[var(--amber-mid)] border border-[#fbbf24] rounded-[14px] px-4 py-3 flex items-center gap-2.5 w-full text-right"
          >
            <div className="text-lg flex-shrink-0">📷</div>
            <div className="flex-1 text-[13px] font-semibold text-[#92400e]">{uploadError}</div>
            <div className="text-xs text-[#92400e] opacity-60 flex-shrink-0">✕</div>
          </button>
        )}

        {/* Photo strip */}
        {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scroll px-1">
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg flex-shrink-0"
                alt="Walk"
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <input
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex-1 bg-white border border-[var(--border)] rounded-[14px] py-3 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer transition-colors hover:bg-stone100 ${isUploading ? "opacity-50 cursor-not-allowed" : "text-dark"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {isUploading ? "מעלה..." : "צלם תמונה"}
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[var(--border)] px-5 pt-2.5 pb-[30px] flex justify-around z-40">
        <button className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[11px] font-semibold">בית</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-muted-color opacity-30 pointer-events-none select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="text-[11px] font-semibold">לקוחות</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-muted-color opacity-30 pointer-events-none select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span className="text-[11px] font-semibold">הגדרות</span>
        </div>
      </div>

      <DebugPanel
        debug={debug}
        info={{
          elapsed: `${elapsedMinutes}m (+${Math.floor(debug.timeOffset / 60)}m offset)`,
          offline: effectiveOffline,
          walkStatus: debug.forceWalkStatus ?? "LIVE",
          walkEnded,
        }}
      />

      {/* Finish Walk SlideOver */}
      <SlideOver isOpen={isFinishOpen} onClose={() => { setIsFinishOpen(false); setError(null); }} title="סיכום טיול">
        <div className="flex flex-col gap-6">
          {/* Error inside SlideOver */}
          {error && (
            <div className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
              <div className="text-lg flex-shrink-0">⚠️</div>
              <div className="text-[13px] font-semibold text-[#991b1b]">{error}</div>
            </div>
          )}

          <div className="bg-brand-light rounded-[18px] p-5 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <div className="text-lg font-bold text-brand-dark mb-1">טיול מוצלח!</div>
            <div className="text-sm text-brand-dark/70">{dogName} איתך</div>
            <div className="mt-4 font-numbers text-2xl font-bold text-brand-dark">
              {timerText}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">
              הערה לבעלים
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="איך היה הטיול? (למשל: עשינו צרכים, פגשנו חברים...)"
              maxLength={2000}
              className="w-full bg-stone100 border-2 border-[var(--border)] rounded-[14px] py-3.5 px-4 outline-none focus:border-brand min-h-[100px] resize-none text-dark"
            />
          </div>

          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto hide-scroll">
              {photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="Walk" />
              ))}
            </div>
          )}

          <button
            data-testid="end-walk-confirm"
            onClick={handleFinishWalk}
            disabled={isEnding}
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-[17px] text-center shadow-glow-brand transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isEnding ? "מסיים..." : "סיים טיול"}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}
