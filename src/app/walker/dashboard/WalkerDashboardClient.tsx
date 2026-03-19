"use client";

import { useState, useEffect, useTransition } from "react";
import { Play, Square, Clock, Footprints, Banknote, Check } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { DogAvatar } from "@/components/shared/DogAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { WalkerDashboardData } from "./actions";
import { startBatchWalksAction, endAllActiveWalksAction } from "./actions";

type Props = {
  data: WalkerDashboardData;
};

function formatDuration(startedAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(startedAt).getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function WalkerDashboardClient({ data }: Props) {
  const [selectedDogs, setSelectedDogs] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");

  // Update timer every second when there's an active batch
  useEffect(() => {
    if (!data.activeBatch) return;

    const updateTimer = () => {
      setElapsedTime(formatDuration(data.activeBatch!.startedAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data.activeBatch]);

  function toggleDog(dogId: string) {
    const newSelected = new Set(selectedDogs);
    if (newSelected.has(dogId)) {
      newSelected.delete(dogId);
    } else {
      if (newSelected.size < 5) {
        newSelected.add(dogId);
      }
    }
    setSelectedDogs(newSelected);
  }

  function handleStartWalk() {
    if (selectedDogs.size === 0) return;
    startTransition(async () => {
      await startBatchWalksAction(Array.from(selectedDogs));
      setSelectedDogs(new Set());
    });
  }

  function handleEndWalk() {
    startTransition(async () => {
      await endAllActiveWalksAction();
    });
  }

  const isLive = data.activeBatch !== null;
  const availableDogs = data.assignedDogs.filter(
    (dog) => !data.activeWalks.some((w) => w.dogId === dog.dogId)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <TopBar name={data.user.name} notificationsCount={0} messagesCount={0} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* LIVE Walk Card */}
        {isLive && data.activeBatch && (
          <section 
            className="bg-card rounded-2xl p-4 border-2 border-primary"
            style={{ boxShadow: "0 10px 40px -10px rgb(22 163 74 / 0.35)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status="LIVE" />
              <span className="font-mono text-2xl font-semibold text-primary">
                {elapsedTime}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {data.activeBatch.dogNames.map((name, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-primary-light text-primary text-sm font-medium rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>

            <button
              onClick={handleEndWalk}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
              סיים טיול
            </button>
          </section>
        )}

        {/* Daily Summary */}
        <section className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">סיכום יומי</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-1">
                <Footprints className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-semibold text-foreground">{data.todaySummary.walkCount}</p>
              <p className="text-xs text-muted-foreground">טיולים</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-1">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xl font-semibold text-foreground font-mono">{data.todaySummary.totalMinutes}</p>
              <p className="text-xs text-muted-foreground">דקות</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-1">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-semibold text-foreground font-mono">{data.todaySummary.earnings.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{"₪"}</p>
            </div>
          </div>
        </section>

        {/* Dog Selection Grid */}
        {!isLive && availableDogs.length > 0 && (
          <section className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">בחר כלבים לטיול</h2>
              <span className="text-xs text-muted-foreground">
                {selectedDogs.size}/5 נבחרו
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {availableDogs.map((dog) => {
                const isSelected = selectedDogs.has(dog.dogId);
                return (
                  <button
                    key={dog.dogId}
                    onClick={() => toggleDog(dog.dogId)}
                    className={`
                      relative flex flex-col items-center p-3 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? "border-primary bg-primary-light" 
                        : "border-border bg-background hover:border-primary/50"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <DogAvatar name={dog.dogName} size="md" />
                    <p className="mt-2 text-sm font-medium text-foreground truncate w-full text-center">
                      {dog.dogName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dog.currentPrice} {dog.currency}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Walks List (when LIVE) */}
        {isLive && data.activeWalks.length > 0 && (
          <section className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">כלבים בטיול</h2>
            <div className="space-y-3">
              {data.activeWalks.map((walk) => (
                <div 
                  key={walk.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-xl"
                >
                  <DogAvatar name={walk.dogName} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{walk.dogName}</p>
                    {walk.dogBreed && (
                      <p className="text-xs text-muted-foreground">{walk.dogBreed}</p>
                    )}
                  </div>
                  <StatusBadge status="LIVE" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Open Balances */}
        {data.openPeriods.length > 0 && (
          <section className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">יתרות פתוחות</h2>
            <div className="space-y-2">
              {data.openPeriods.map((period) => (
                <div 
                  key={period.id}
                  className="flex items-center justify-between p-3 bg-background rounded-xl"
                >
                  <div>
                    <p className="font-medium text-foreground">{period.ownerName}</p>
                    <p className="text-xs text-muted-foreground">{period.walkCount} טיולים</p>
                  </div>
                  <span className="font-mono font-semibold text-primary">
                    {parseFloat(period.totalAmount).toFixed(0)} {"₪"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLive && availableDogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Footprints className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">אין כלבים זמינים</h3>
            <p className="text-muted-foreground text-sm">
              כל הכלבים שלך כרגע בטיול או שאין לך כלבים משויכים
            </p>
          </div>
        )}
      </main>

      {/* Sticky CTA */}
      {!isLive && selectedDogs.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 max-w-[430px] mx-auto px-4 pb-4">
          <button
            onClick={handleStartWalk}
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            style={{ boxShadow: "0 10px 40px -10px rgb(22 163 74 / 0.35)" }}
          >
            <Play className="w-5 h-5" />
            התחל טיול ({selectedDogs.size} כלבים)
          </button>
        </div>
      )}

      <BottomNav variant="walker" active="home" />
    </div>
  );
}
