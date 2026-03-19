"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Plus, ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { DogAvatar } from "@/components/shared/DogAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { OwnerDashboardData } from "./actions";

type Props = {
  data: OwnerDashboardData;
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "עכשיו";
  if (diffMins < 60) return `לפני ${diffMins} דק'`;
  if (diffHours < 24) return `לפני ${diffHours} שע'`;
  if (diffDays === 1) return "אתמול";
  return `לפני ${diffDays} ימים`;
}

function formatDuration(startedAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(startedAt).getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function OwnerDashboardClient({ data }: Props) {
  const [selectedDogFilter, setSelectedDogFilter] = useState<string | null>(null);
  const [liveTimers, setLiveTimers] = useState<Record<string, string>>({});

  // Update live timers
  useEffect(() => {
    const dogsWithLive = data.dogs.filter(d => d.liveWalk);
    if (dogsWithLive.length === 0) return;

    const updateTimers = () => {
      const newTimers: Record<string, string> = {};
      dogsWithLive.forEach(dog => {
        if (dog.liveWalk) {
          newTimers[dog.id] = formatDuration(dog.liveWalk.startTime);
        }
      });
      setLiveTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [data.dogs]);

  const hasLiveWalk = data.dogs.some(d => d.liveWalk);
  const filteredDogs = selectedDogFilter 
    ? data.dogs.filter(d => d.id === selectedDogFilter)
    : data.dogs;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <TopBar name={data.user.name} notificationsCount={0} messagesCount={0} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Live Walk Banner */}
        {hasLiveWalk && (
          <section className="bg-primary-light border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-live" />
              <span className="text-sm font-medium text-primary">טיול פעיל עכשיו</span>
            </div>
            {data.dogs.filter(d => d.liveWalk).map(dog => (
              <div key={dog.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DogAvatar name={dog.name} imageUrl={dog.imageUrl} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{dog.name}</p>
                    <p className="text-xs text-muted-foreground">
                      עם {dog.liveWalk?.walkerName}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-lg font-semibold text-primary">
                  {liveTimers[dog.id] || "00:00"}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Dog Filter Pills */}
        {data.dogs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <button
              onClick={() => setSelectedDogFilter(null)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedDogFilter === null 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              הכל
            </button>
            {data.dogs.map(dog => (
              <button
                key={dog.id}
                onClick={() => setSelectedDogFilter(dog.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2
                  ${selectedDogFilter === dog.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }
                `}
              >
                {dog.name}
                {dog.liveWalk && (
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-live" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dog Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">הכלבים שלי</h2>
            <Link 
              href="/owner/dogs/new"
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              <Plus className="w-4 h-4" />
              הוסף כלב
            </Link>
          </div>

          {filteredDogs.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <p className="text-muted-foreground mb-4">אין לך כלבים עדיין</p>
              <Link 
                href="/owner/dogs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                הוסף כלב ראשון
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDogs.map(dog => (
                <Link
                  key={dog.id}
                  href={`/dog/${dog.id}`}
                  className="block bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <DogAvatar name={dog.name} imageUrl={dog.imageUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground">{dog.name}</h3>
                        {dog.liveWalk ? (
                          <StatusBadge status="LIVE" />
                        ) : dog.lastWalk ? (
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(dog.lastWalk.completedAt)}
                          </span>
                        ) : null}
                      </div>
                      {dog.breed && (
                        <p className="text-sm text-muted-foreground mb-2">{dog.breed}</p>
                      )}
                      
                      {/* Walker info */}
                      {dog.walkers.filter(w => w.isActive).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {dog.walkers.filter(w => w.isActive).map(walker => (
                            <span 
                              key={walker.dogWalkerId}
                              className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                            >
                              {walker.displayName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Last walk info */}
                      {dog.lastWalk && !dog.liveWalk && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {dog.lastWalk.durationMinutes} דק' עם {dog.lastWalk.walkerName}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Walks */}
        {data.recentWalks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">טיולים אחרונים</h2>
              <Link 
                href="/owner/walks"
                className="text-sm text-primary font-medium hover:underline"
              >
                הכל
              </Link>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {data.recentWalks.slice(0, 5).map((walk, index) => (
                <div
                  key={walk.id}
                  className={`flex items-center gap-3 p-3 ${
                    index !== data.recentWalks.slice(0, 5).length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <DogAvatar name={walk.dogName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{walk.dogName}</p>
                    <p className="text-xs text-muted-foreground">
                      {walk.walkerName} • {walk.durationMinutes ?? "—"} דק'
                    </p>
                  </div>
                  <StatusBadge status={walk.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav variant="owner" active="home" />
    </div>
  );
}
