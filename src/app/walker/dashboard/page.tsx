import { PawPrint } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getWalkerDashboardAction, startWalkAction, endWalkAction } from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { AssignedDogCard } from "@/components/walks/assigned-dog-card";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function WalkerDashboardPage() {
  const [user, { assignedDogs, activeWalks }] = await Promise.all([
    getCurrentUser(),
    getWalkerDashboardAction(),
  ]);

  return (
    <>
      <main className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">שלום, {user?.name ?? "דני"}!</h1>
            <p className="text-muted-foreground mt-1">מוכנים לטיול הבא?</p>
          </div>
          <EnableNotificationsButton />
        </div>

        {activeWalks.length > 0 && (
          <div className="space-y-2">
            {activeWalks.map((walk) => (
              <div
                key={walk.id}
                className="rounded-2xl bg-[#2A9D8F]/10 border-r-4 border-[#2A9D8F] p-4 flex items-center justify-between"
              >
                <p className="font-semibold text-[#1a6b61]">
                  בטיול כרגע: {walk.dogName}
                </p>
                <form action={endWalkAction.bind(null, walk.id)}>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#F4A261] text-white text-sm font-semibold"
                  >
                    סיים טיול
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {assignedDogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <PawPrint size={48} className="opacity-30" />
            <p>אין כלבים משויכים</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedDogs.map((dog) => (
              <AssignedDogCard key={dog.dogWalkerId} dog={dog} startWalkAction={startWalkAction} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
