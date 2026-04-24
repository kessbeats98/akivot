import { PawPrint } from "lucide-react";
import type { WalkWithDog } from "@/lib/services/walks/types";

type ActiveWalkBannerProps = {
  walk: WalkWithDog;
  endWalkAction: (walkId: string, formData: FormData) => Promise<void>;
};

export function ActiveWalkBanner({ walk, endWalkAction }: ActiveWalkBannerProps) {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-[#2A9D8F] text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-[#2A9D8F]/20">
        <div className="flex items-center gap-3">
          <PawPrint size={22} className="shrink-0" />
          <div>
            <p className="font-bold text-base">בטיול כרגע: {walk.dogName}</p>
            <p className="text-xs opacity-90">המיקום משותף עם הבעלים</p>
          </div>
        </div>
        {/* Pulse dot */}
        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-white" />
        </div>
      </div>

      <form action={endWalkAction.bind(null, walk.id)}>
        <button
          type="submit"
          className="w-full h-14 rounded-xl bg-[#F4A261] text-white font-bold text-lg shadow-md"
        >
          סיים טיול
        </button>
      </form>
    </div>
  );
}
