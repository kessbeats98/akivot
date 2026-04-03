"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlideOver } from "@/components/ui/slide-over";
import type { AssignedDog } from "@/lib/services/walks/types";
import { getActionError } from "@/lib/action-utils";
import { useDebugMode } from "@/lib/hooks/useDebugMode";
import { DebugPanel } from "@/components/DebugPanel";
import { seedTestScenarioAction, resetTestDataAction } from "@/app/dev/actions";

interface Props {
  userName: string;
  assignedDogs: AssignedDog[];
  startWalkAction: (dogId: string, formData: FormData) => Promise<void>;
  notificationsButton: ReactNode;
  autoClosedReason?: boolean;
}

export function WalkerDashboardClient({
  userName,
  assignedDogs,
  startWalkAction,
  notificationsButton,
  autoClosedReason,
}: Props) {
  const [isStartWalkOpen, setIsStartWalkOpen] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAutoClosedBanner, setShowAutoClosedBanner] = useState(autoClosedReason ?? false);
  const [isOffline, setIsOffline] = useState(false);
  const debug = useDebugMode();
  const router = useRouter();

  // Strip ?reason= from URL after rendering banner
  useEffect(() => {
    if (autoClosedReason) {
      history.replaceState(null, "", "/walker/dashboard");
    }
  }, [autoClosedReason]);

  // Register window.__akivotSeed in debug mode
  useEffect(() => {
    if (!debug.enabled) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__akivotSeed = async () => {
      const result = await seedTestScenarioAction();
      router.refresh();
      return result;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__akivotReset = async () => {
      await resetTestDataAction();
      router.refresh();
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { delete (window as any).__akivotSeed; delete (window as any).__akivotReset; };
  }, [debug.enabled, router]);

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

  const toggleDog = (dogId: string) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId],
    );
  };

  const handleStartWalk = useCallback(async () => {
    const dogId = selectedDogs[0];
    if (!dogId || isStarting) return; // double-start guard
    if (!navigator.onLine || debug.forceOffline) {
      setError("אין חיבור לאינטרנט — נסה שוב כשיש חיבור");
      return;
    }
    setIsStarting(true);
    setError(null);
    console.log("[walker/dashboard] startWalk requested", { dogId });
    try {
      const fd = new FormData();
      await startWalkAction(dogId, fd);
      console.log("[walker/dashboard] startWalk success — redirecting to /walker/live");
      // startWalkAction calls revalidatePath + redirect on success
    } catch (err) {
      const msg = getActionError(err, { action: "startWalk", dogId });
      setError(msg);
      setIsStarting(false);
    }
  }, [selectedDogs, isStarting, startWalkAction, debug.forceOffline]);

  const formatPrice = (price: string, currency: string) => {
    if (currency === "ILS") return `₪${price}`;
    return `${price} ${currency}`;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "בוקר טוב";
    if (h < 17) return "אחר הצהריים טוב";
    return "ערב טוב";
  };

  const dismissError = () => setError(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="px-5 pt-[52px] pb-3.5 flex items-center justify-end flex-shrink-0">
        <div className="flex items-center gap-2">
          {notificationsButton}
          <div className="text-xl font-extrabold text-brand tracking-tight">עקבות</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-[100px] flex flex-col gap-3 overflow-y-auto">

        {/* Offline indicator */}
        {(isOffline || debug.forceOffline) && (
          <div className="bg-stone100 border border-[var(--border)] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            <div className="text-[13px] text-muted-color">אין חיבור לאינטרנט</div>
          </div>
        )}

        {/* Auto-closed walk notice */}
        {showAutoClosedBanner && (
          <button
            onClick={() => setShowAutoClosedBanner(false)}
            className="bg-brand-light border border-[#86efac] rounded-[14px] px-4 py-3 flex items-center gap-2.5 w-full text-right"
          >
            <div className="text-lg flex-shrink-0">✓</div>
            <div className="flex-1 text-[13px] font-semibold text-brand-dark">הטיול הסתיים אוטומטית</div>
            <div className="text-xs text-brand-dark opacity-60 flex-shrink-0">✕</div>
          </button>
        )}

        {/* Global error banner */}
        {error && (
          <button
            onClick={dismissError}
            className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[14px] px-4 py-3 flex items-center gap-2.5 w-full text-right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div className="flex-1 text-[13px] font-semibold text-[#991b1b]">{error}</div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 opacity-50"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}

        {/* Idle message */}
        {assignedDogs.length > 0 ? (
          <div className="text-center pt-3 pb-1">
            <div className="text-xl font-bold text-dark mb-1">{getGreeting()}, {userName}</div>
            <div className="text-sm text-muted-color">אין הליכה פעילה כרגע</div>
          </div>
        ) : (
          <div data-testid="empty-state" className="text-center pt-3 pb-1">
            <div className="text-xl font-bold text-dark mb-1">ברוך הבא</div>
            <div className="text-sm text-muted-color">אין כלבים משויכים כרגע</div>
          </div>
        )}

        {/* Dog cards */}
        {assignedDogs.length > 0 && (() => {
          const firstDog = assignedDogs[0]!;
          return (
          <>
            {/* First dog card — taps to open start-walk */}
            <button
              data-testid="start-walk"
              onClick={() => {
                setSelectedDogs([firstDog.dogId]);
                setIsStartWalkOpen(true);
                setError(null);
              }}
              className="bg-white border border-[var(--border)] rounded-[18px] p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-stone100 text-right w-full"
            >
              <div className="w-[46px] h-[46px] rounded-[14px] bg-brand-light flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M4 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M18 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M15 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M12 11c-2.2 0-4 1.5-4 4 0 1.5.5 2.5 1.5 3.5l.5.5h4l.5-.5c1-1 1.5-2 1.5-3.5 0-2.5-1.8-4-4-4z"/></svg>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-[11px] text-muted-color mb-0.5">הבא בתור</div>
                <div className="text-base font-bold text-dark">{firstDog.dogName}</div>
                {firstDog.ownerName && (
                  <div className="text-xs text-muted-color mt-0.5">{firstDog.ownerName}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="font-numbers text-lg font-bold text-amber">
                  {formatPrice(firstDog.currentPrice, firstDog.currency)}
                </div>
                <div className="bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  התחל
                </div>
              </div>
            </button>

            {/* Rest of day list */}
            {assignedDogs.length > 1 && (
              <div className="bg-white border border-[var(--border)] rounded-[18px] overflow-hidden">
                <div className="text-[12px] font-semibold text-muted-color px-[18px] py-3 border-b border-stone100">
                  כלבים נוספים
                </div>
                {assignedDogs.slice(1).map((dog) => (
                  <button
                    key={dog.dogWalkerId}
                    onClick={() => {
                      setSelectedDogs([dog.dogId]);
                      setIsStartWalkOpen(true);
                      setError(null);
                    }}
                    className="flex items-center justify-between px-[18px] py-3.5 border-b border-stone100 last:border-b-0 cursor-pointer transition-colors hover:bg-stone100 w-full text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--border)] flex-shrink-0" />
                      <div>
                        <div className="text-[15px] font-semibold text-dark">{dog.dogName}</div>
                        {dog.ownerName && (
                          <div className="text-[11px] text-muted-color mt-0.5">{dog.ownerName}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-numbers text-sm font-semibold text-muted-color">
                        {formatPrice(dog.currentPrice, dog.currency)}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
          );
        })()}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[var(--border)] px-5 pt-2.5 pb-[30px] flex justify-around z-40">
        <button className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[11px] font-semibold">בית</span>
        </button>
        <Link href="/walker/dogs" className="flex flex-col items-center gap-1 text-muted-color hover:text-brand transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="text-[11px] font-semibold">לקוחות</span>
        </Link>
        <Link href="/walker/settings" className="flex flex-col items-center gap-1 text-muted-color hover:text-brand transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span className="text-[11px] font-semibold">הגדרות</span>
        </Link>
      </div>

      <DebugPanel
        debug={debug}
        info={{
          offline: isOffline || debug.forceOffline,
          dogs: assignedDogs.length,
          autoClosedBanner: showAutoClosedBanner,
        }}
        onSeed={async () => {
          await seedTestScenarioAction();
          router.refresh();
        }}
        onRefresh={() => router.refresh()}
      />

      {/* Start Walk SlideOver */}
      <SlideOver
        isOpen={isStartWalkOpen}
        onClose={() => { setIsStartWalkOpen(false); setError(null); }}
        title="בחירת כלב לטיול"
      >
        <div className="flex flex-col gap-6">
          {/* Error inside SlideOver */}
          {error && (
            <div className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[14px] px-4 py-3 flex items-center gap-2.5">
              <div className="text-lg flex-shrink-0">⚠️</div>
              <div className="text-[13px] font-semibold text-[#991b1b]">{error}</div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {assignedDogs.map((dog) => (
              <button
                key={dog.dogWalkerId}
                onClick={() => toggleDog(dog.dogId)}
                disabled={isStarting}
                className={`relative p-4 rounded-[18px] border-2 transition-all flex items-center gap-3 text-right ${
                  selectedDogs.includes(dog.dogId)
                    ? "border-brand bg-brand-light"
                    : "border-gray-100 bg-white"
                } ${isStarting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold flex-shrink-0 ${
                  selectedDogs.includes(dog.dogId)
                    ? "bg-brand-dark text-white"
                    : "bg-brand-light text-brand-dark"
                }`}>
                  {dog.dogName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-dark">{dog.dogName}</div>
                  {dog.dogBreed && (
                    <div className="text-xs text-muted-color mt-0.5">{dog.dogBreed}</div>
                  )}
                  {dog.ownerName && (
                    <div className="text-xs text-muted-color">{dog.ownerName}</div>
                  )}
                </div>
                <div className="font-numbers text-sm font-bold text-amber flex-shrink-0">
                  {formatPrice(dog.currentPrice, dog.currency)}
                </div>
                {selectedDogs.includes(dog.dogId) && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            data-testid="start-walk-confirm"
            onClick={handleStartWalk}
            disabled={selectedDogs.length === 0 || isStarting}
            className={`w-full py-4 rounded-2xl font-bold text-[17px] text-center transition-all flex items-center justify-center gap-2.5 ${
              selectedDogs.length > 0 && !isStarting
                ? "bg-brand text-white shadow-glow-brand"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isStarting ? (
              "מתחיל טיול..."
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                צא לדרך!
              </>
            )}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}
