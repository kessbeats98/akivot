"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { DogWithWalkers, ActiveLiveWalk } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import { getWalkHistoryForDogAction, createDogAction } from "./actions";
import { OwnerDogSelector } from "./components/OwnerDogSelector";
import { OwnerCurrentStatusCard } from "./components/OwnerCurrentStatusCard";
import { OwnerHistorySection } from "./components/OwnerHistorySection";

interface Props {
  dogs: DogWithWalkers[];
  liveWalks: ActiveLiveWalk[];
  notificationsButton: ReactNode;
}

export function OwnerDashboardClient({ dogs, liveWalks, notificationsButton }: Props) {
  const router = useRouter();
  const [selectedDogId, setSelectedDogId] = useState<string>(dogs[0]?.id ?? "");
  const [walkHistory, setWalkHistory] = useState<DogWalkHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());

  // Auto-refresh every 30s
  useEffect(() => {
    console.log("[owner/dashboard] mounted, auto-refresh every 30s");
    const id = setInterval(() => {
      router.refresh();
      setLastRefreshed(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  // Immediate refresh on tab focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        setLastRefreshed(new Date());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [router]);

  // Load walk history on mount and dog selection change
  useEffect(() => {
    if (!selectedDogId) return;
    setHistoryLoading(true);
    setHistoryError(null);
    console.log("[owner/dashboard] loading walk history for dog:", selectedDogId);
    getWalkHistoryForDogAction(selectedDogId)
      .then((data) => {
        setWalkHistory(data);
        console.log("[owner/dashboard] walk history loaded:", data.length, "walks");
      })
      .catch((err) => {
        console.error("[owner/dashboard] walk history load failed:", err);
        setHistoryError("שגיאה בטעינת היסטוריית טיולים");
        setWalkHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [selectedDogId]);

  const selectedDog = dogs.find((d) => d.id === selectedDogId);
  const liveWalk = liveWalks.find((w) => w.dogId === selectedDogId) ?? null;
  const hasActiveWalker = (selectedDog?.walkers ?? []).some((w) => w.isActive);
  const liveWalkDogIds = new Set(liveWalks.map((w) => w.dogId));
  const lastCompletedWalk =
    walkHistory.find((w) => w.status === "COMPLETED" || w.status === "AUTO_CLOSED") ?? null;
  const hasHistory = walkHistory.some(
    (w) => w.status === "COMPLETED" || w.status === "AUTO_CLOSED"
  );

  if (!selectedDog) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-6 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="text-[22px] font-extrabold text-brand tracking-tight">עקבות</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6" data-testid="empty-state">
          <div className="text-[56px]">🐾</div>
          <div className="text-xl font-bold text-dark">ברוך הבא!</div>
          <div className="text-sm text-muted-color text-center mb-2">
            הוסף את הכלב הראשון — ואנחנו נדאג לשאר
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 w-full max-w-xs">
            <form action={createDogAction} className="flex items-center gap-2">
              <input
                type="text"
                name="name"
                required
                placeholder="שם הכלב"
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
              >
                הוספה
              </button>
            </form>
            <div className="text-xs text-muted-color text-center mt-3">אפשר להוסיף כלבים נוספים בהמשך</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {/* Topbar */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-xl">
            {selectedDog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedDog.imageUrl} alt={selectedDog.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              "🐕"
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-dark">{selectedDog.name}</div>
            {dogs.length === 1 && (
              <Link href="/owner/dogs" className="text-xs text-muted-color hover:text-brand transition-colors">
                ניהול כלבים
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notificationsButton}
          <div className="text-[22px] font-extrabold text-brand tracking-tight">עקבות</div>
        </div>
      </div>

      {/* Last updated */}
      <div className="text-[11px] text-muted-color text-center -mt-2 mb-1">
        עודכן {lastRefreshed.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-10 flex flex-col gap-5 overflow-y-auto">
        {/* Dog selector (multi-dog) */}
        {dogs.length > 1 && (
          <>
            <OwnerDogSelector
              dogs={dogs}
              selectedDogId={selectedDogId}
              liveWalkDogIds={liveWalkDogIds}
              onSelect={setSelectedDogId}
            />
            <Link href="/owner/dogs" className="text-xs text-muted-color text-center -mt-2 hover:text-brand transition-colors">
              ניהול כלבים
            </Link>
          </>
        )}

        {/* Status card */}
        <OwnerCurrentStatusCard
          dogName={selectedDog.name}
          liveWalk={liveWalk}
          lastCompletedWalk={lastCompletedWalk}
          hasActiveWalker={hasActiveWalker}
        />

        {/* Assign-walker CTA */}
        {!hasActiveWalker && !liveWalk && (
          <Link
            href={`/owner/dog-profile/${selectedDogId}`}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <span className="material-symbols-rounded text-amber-600 text-xl">person_add</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-900">עדיין לא שויך מוביל ל{selectedDog.name}</div>
              <div className="text-xs text-amber-700 mt-0.5">שייך מוביל כדי שאפשר יהיה להתחיל טיולים</div>
            </div>
            <span className="material-symbols-rounded text-amber-400 text-lg">chevron_left</span>
          </Link>
        )}

        {/* Last walk summary */}
        {lastCompletedWalk && (
          <div className="rounded-2xl px-[18px] py-3.5 flex items-center justify-between">
            <div className="text-sm text-muted-color">
              הטיול האחרון: {format(new Date(lastCompletedWalk.startTime), "d בMMM, HH:mm", { locale: he })}
            </div>
            <div className="font-numbers text-[15px] font-medium text-muted-color">
              {lastCompletedWalk.durationMinutes != null
                ? `${lastCompletedWalk.durationMinutes} דק׳`
                : "—"}
            </div>
          </div>
        )}

        {/* History section — shown only while loading or when completed walks exist */}
        {(historyLoading || hasHistory) && (
          <div>
            <h2 className="text-sm font-bold text-dark mb-3">טיולים אחרונים</h2>
            {historyLoading ? (
              <div className="bg-white rounded-[2rem] p-8 flex items-center justify-center border border-gray-100">
                <span className="material-symbols-rounded text-brand/40 text-3xl animate-spin">progress_activity</span>
              </div>
            ) : historyError ? (
              <button
                onClick={() => {
                  setHistoryError(null);
                  setHistoryLoading(true);
                  getWalkHistoryForDogAction(selectedDogId)
                    .then(setWalkHistory)
                    .catch(() => setHistoryError("שגיאה בטעינת היסטוריית טיולים"))
                    .finally(() => setHistoryLoading(false));
                }}
                className="bg-[var(--red-light)] border border-[#fca5a5] rounded-[18px] p-6 flex flex-col items-center gap-2 w-full"
              >
                <div className="text-2xl">⚠️</div>
                <div className="text-sm font-semibold text-[#991b1b]">{historyError}</div>
                <div className="text-xs text-[#991b1b] opacity-70">לחץ לנסות שוב</div>
              </button>
            ) : (
              <OwnerHistorySection walks={walkHistory} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
