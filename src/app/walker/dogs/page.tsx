import { PawPrint } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getWalkerDashboardAction } from "@/app/walker/dashboard/actions";

export default async function WalkerDogsPage() {
  const { assignedDogs } = await getWalkerDashboardAction();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]" dir="rtl">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-10 pb-4">
        <PawPrint size={24} className="text-[#2A9D8F]" />
        <h1 className="text-xl font-bold text-neutral-800">הכלבים שלי</h1>
      </header>

      <main className="flex-1 px-6 pb-28 space-y-3">
        {assignedDogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PawPrint size={40} className="text-[#2A9D8F]/30" />
            <p className="text-neutral-400 text-sm">אין כלבים משויכים</p>
          </div>
        ) : (
          assignedDogs.map((dog) => (
            <div
              key={dog.dogWalkerId}
              className="bg-white rounded-xl p-4 flex items-center gap-4 border border-[#2A9D8F]/5 shadow-sm"
            >
              <div className="w-11 h-11 rounded-full bg-[#2A9D8F] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">
                  {dog.dogName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-neutral-800">{dog.dogName}</p>
                {dog.dogBreed && (
                  <p className="text-sm text-neutral-400">{dog.dogBreed}</p>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
