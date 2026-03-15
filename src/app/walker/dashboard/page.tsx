import { getCurrentUser } from "@/lib/auth/session";
import { getWalkerDashboardAction, startWalkAction, endWalkAction } from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { BottomNav } from "@/components/layout/bottom-nav";
import { HeroCta } from "@/components/walker/hero-cta";
import { ActiveWalkBanner } from "@/components/walker/active-walk-banner";
import { StatsGrid } from "@/components/walker/stats-grid";

export default async function WalkerDashboardPage() {
  const [user, { assignedDogs, activeWalks }] = await Promise.all([
    getCurrentUser(),
    getWalkerDashboardAction(),
  ]);

  const activeWalk = activeWalks[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-[#2A9D8F]/10 border-2 border-[#2A9D8F]/20 flex items-center justify-center">
            <span className="text-[#2A9D8F] font-bold text-base">
              {(user?.name ?? "ד").charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-xs text-neutral-400">ברוך הבא,</p>
            <p className="text-sm font-semibold text-neutral-700">{user?.name ?? "דני"}</p>
          </div>
        </div>
        {/* Bell = EnableNotificationsButton */}
        <EnableNotificationsButton />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-5 pb-36">
        {/* Greeting */}
        <section className="mb-6">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
            שלום, {user?.name ?? "דני"}
          </h1>
          <p className="text-xl text-neutral-400 mt-2">מוכנים לטיול הבא?</p>
        </section>

        {/* Hero area */}
        <section className="flex-1 flex flex-col items-center justify-center">
          {activeWalk ? (
            <ActiveWalkBanner walk={activeWalk} endWalkAction={endWalkAction} />
          ) : (
            <HeroCta assignedDogs={assignedDogs} startWalkAction={startWalkAction} />
          )}
        </section>

        {/* Stats */}
        <StatsGrid dogCount={assignedDogs.length} />
      </main>

      <BottomNav />

      {/* Background glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-[#2A9D8F]/10 blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}
