"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SlideOver } from "@/components/ui/slide-over";
import type { AssignedDog } from "@/lib/services/walks/types";
import type { ConfirmationCardView } from "@/lib/services/confirmations/types";
import { getActionError } from "@/lib/action-utils";
import { useDebugMode } from "@/lib/hooks/useDebugMode";
import { DebugPanel } from "@/components/DebugPanel";
import { seedTestScenarioAction, resetTestDataAction } from "@/app/dev/actions";

interface Props {
  userName: string;
  assignedDogs: AssignedDog[];
  confirmations: Record<string, ConfirmationCardView>;
  startWalkAction: (dogId: string, formData: FormData) => Promise<void>;
  requestConfirmationAction: (dogId: string, formData: FormData) => Promise<void>;
  notificationsButton: ReactNode;
  autoClosedReason?: boolean;
}

export function WalkerDashboardClient({
  userName,
  assignedDogs,
  confirmations,
  startWalkAction,
  requestConfirmationAction,
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

  const selectDog = (dogId: string) => {
    setSelectedDogs([dogId]);
  };

  const startWalkForDog = useCallback(async (dogId: string) => {
    if (isStarting) return;
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
    } catch (err) {
      const msg = getActionError(err, { action: "startWalk", dogId });
      setError(msg);
      setIsStarting(false);
    }
  }, [isStarting, startWalkAction, debug.forceOffline]);

  const handleStartWalk = useCallback(async () => {
    if (selectedDogs[0]) await startWalkForDog(selectedDogs[0]);
  }, [selectedDogs, startWalkForDog]);

  const formatPrice = (price: string, currency: string) => {
    if (currency === "ILS") return `₪${price}`;
    return `${price} ${currency}`;
  };

  const isPriceUnset = (price: string) => !price || price === "0.00";

  const [askingDogId, setAskingDogId] = useState<string | null>(null);

  const askForDog = useCallback(async (dogId: string) => {
    if (askingDogId) return;
    setAskingDogId(dogId);
    try {
      const fd = new FormData();
      await requestConfirmationAction(dogId, fd);
      router.refresh();
    } catch (err) {
      const msg = getActionError(err, { action: "requestConfirmation", dogId });
      setError(msg);
    } finally {
      setAskingDogId(null);
    }
  }, [askingDogId, requestConfirmationAction, router]);

  const renderConfirmation = (dogId: string) => {
    const c = confirmations[dogId];
    if (c) {
      if (c.state === "WAITING") {
        return (
          <div className="text-[11px] text-muted-color px-1 pt-1">
            ממתין לתשובת בעלים
          </div>
        );
      }
      if (c.state === "CONFIRMED") {
        return (
          <div className="text-[11px] text-emerald-700 px-1 pt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            מאושר להיום
          </div>
        );
      }
      return (
        <div className="text-[11px] text-gray-500 px-1 pt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          לא צריך היום
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => askForDog(dogId)}
        disabled={askingDogId === dogId}
        className="text-[11px] text-muted-color hover:text-brand transition-colors px-1 pt-1 text-right disabled:opacity-60"
      >
        שאל את הבעלים — היום?
      </button>
    );
  };

  const dismissError = () => setError(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="px-5 pt-[52px] pb-3.5 flex items-center justify-end flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/walker/settings" className="text-white/40 hover:text-white/60 transition-colors">
            <span className="material-symbols-rounded text-2xl">settings</span>
          </Link>
          {notificationsButton}
          <div className="text-xl font-extrabold text-brand tracking-tight">עקבות</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-3 overflow-y-auto">

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

        {/* Empty state */}
        {assignedDogs.length === 0 && (
          <div data-testid="empty-state" className="flex flex-col items-center justify-center pt-10 pb-4 gap-3">
            <div className="text-[48px]">🐾</div>
            <div className="text-lg font-bold text-dark text-center">אין כלבים משויכים</div>
            <div className="text-sm text-muted-color text-center max-w-[220px]">כשבעל כלב ישייך אותך, הכלב יופיע כאן</div>
          </div>
        )}

        {/* Dog queue */}
        {assignedDogs.length > 0 && (() => {
          const primaryDog =
            assignedDogs.find((dog) => !isPriceUnset(dog.currentPrice)) ?? assignedDogs[0]!;
          const secondaryDogs = assignedDogs.filter(
            (dog) => dog.dogWalkerId !== primaryDog.dogWalkerId,
          );
          return (
          <>
            <div className="flex flex-col gap-2">
              {/* Primary dog card — prefer the first actionable dog, fall back to the first assigned dog */}
              {isPriceUnset(primaryDog.currentPrice) ? (
                <div
                  data-testid="start-walk-blocked"
                  className="bg-white border border-[var(--border)] rounded-[18px] p-4 flex items-center gap-3 text-right w-full"
                >
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-[17px] font-extrabold text-dark leading-tight">{primaryDog.dogName}</div>
                    {primaryDog.ownerName && (
                      <div className="text-xs text-muted-color mt-0.5">{primaryDog.ownerName}</div>
                    )}
                    <div className="text-xs text-muted-color mt-1">מחיר לא הוגדר</div>
                  </div>
                  <div className="text-xs text-muted-color px-3 py-2 rounded-full bg-stone-100 flex-shrink-0">
                    ממתין להגדרת מחיר
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <button
                    data-testid="start-walk"
                    onClick={() => {
                      if (isStarting) return;
                      startWalkForDog(primaryDog.dogId);
                    }}
                    disabled={isStarting}
                    className={`bg-white border border-[var(--border)] rounded-[18px] p-4 flex items-center gap-3 transition-colors text-right w-full ${isStarting ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-stone100"}`}
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-[17px] font-extrabold text-dark leading-tight">{primaryDog.dogName}</div>
                      {primaryDog.ownerName && (
                        <div className="text-xs text-muted-color mt-0.5">{primaryDog.ownerName}</div>
                      )}
                      <div className="font-numbers text-xs text-muted-color mt-1">
                        {formatPrice(primaryDog.currentPrice, primaryDog.currency)}
                      </div>
                    </div>
                    <div className={`text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 flex-shrink-0 transition-opacity ${isStarting ? "bg-brand/60" : "bg-brand"}`}>
                      {isStarting ? (
                        <span className="material-symbols-rounded text-sm animate-spin">progress_activity</span>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )}
                      {isStarting ? "מתחיל..." : "התחל"}
                    </div>
                  </button>
                  {assignedDogs.length > 1 && (
                    <button
                      onClick={() => {
                        setSelectedDogs([primaryDog.dogId]);
                        setIsStartWalkOpen(true);
                        setError(null);
                      }}
                      className="text-[12px] text-muted-color text-left px-1 py-0.5 w-fit hover:text-brand transition-colors"
                    >
                      בחר כלב אחר ›
                    </button>
                  )}
                  {renderConfirmation(primaryDog.dogId)}
                </div>
              )}

              {/* Secondary dogs — read-only */}
              {assignedDogs.length > 1 && (
                <div className="text-[11px] text-muted-color px-1 pt-1">לאחר מכן</div>
              )}
              {secondaryDogs.map((dog) => (
                <div
                  key={dog.dogWalkerId}
                  className="flex flex-col px-3 py-3 rounded-[14px] w-full text-right"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-dark">{dog.dogName}</div>
                      {dog.ownerName && <div className="text-[11px] text-muted-color mt-0.5">{dog.ownerName}</div>}
                    </div>
                    <div className="font-numbers text-xs text-muted-color">
                      {isPriceUnset(dog.currentPrice) ? "ממתין להגדרת מחיר" : formatPrice(dog.currentPrice, dog.currency)}
                    </div>
                  </div>
                  {!isPriceUnset(dog.currentPrice) && renderConfirmation(dog.dogId)}
                </div>
              ))}
            </div>
          </>
          );
        })()}
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
        onClose={() => {
          setIsStartWalkOpen(false);
          setError(null);
        }}
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
            {assignedDogs.map((dog) => {
              const isSelected = selectedDogs[0] === dog.dogId;
              const priceBlocked = isPriceUnset(dog.currentPrice);
              return (
                <button
                  key={dog.dogWalkerId}
                  onClick={() => !priceBlocked && selectDog(dog.dogId)}
                  disabled={isStarting || priceBlocked}
                  className={`p-4 rounded-[18px] border-2 transition-all flex items-center gap-3 text-right ${
                    isSelected ? "border-brand bg-brand-light" : "border-gray-100 bg-white"
                  } ${isStarting || priceBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold flex-shrink-0 ${
                    isSelected ? "bg-brand-dark text-white" : "bg-brand-light text-brand-dark"
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
                    {priceBlocked ? (
                      <span className="text-muted-color font-normal">ממתין להגדרת מחיר</span>
                    ) : (
                      formatPrice(dog.currentPrice, dog.currency)
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {(() => {
            const selectedDog = assignedDogs.find((d) => d.dogId === selectedDogs[0]);
            const confirmBlocked = !selectedDog || isPriceUnset(selectedDog.currentPrice);
            return (
          <button
            data-testid="start-walk-confirm"
            onClick={handleStartWalk}
            disabled={selectedDogs.length === 0 || isStarting || confirmBlocked}
            className={`w-full py-4 rounded-2xl font-bold text-[17px] text-center transition-all flex items-center justify-center gap-2.5 ${
              selectedDogs.length > 0 && !isStarting && !confirmBlocked
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
            );
          })()}
        </div>
      </SlideOver>
    </div>
  );
}
