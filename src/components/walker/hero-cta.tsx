"use client";

import { PawPrint } from "lucide-react";
import type { AssignedDog } from "@/lib/services/walks/types";

type HeroCtaProps = {
  assignedDogs: AssignedDog[];
  startWalkAction: (dogId: string, formData: FormData) => Promise<void>;
};

export function HeroCta({ assignedDogs, startWalkAction }: HeroCtaProps) {
  const isEmpty = assignedDogs.length === 0;
  const firstDog = assignedDogs[0] as AssignedDog | undefined;

  return (
    <div className="relative flex items-center justify-center w-full py-8">
      {/* Glow behind */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 bg-[#2A9D8F]/10 rounded-full blur-3xl opacity-50" />
      </div>

      {isEmpty ? (
        <div className="relative flex flex-col items-center justify-center w-64 h-64 rounded-full bg-neutral-200 shadow-inner">
          <PawPrint size={56} className="text-neutral-400 mb-3" />
          <span className="text-sm font-medium text-neutral-500 text-center px-8">
            אין כלבים משויכים
          </span>
        </div>
      ) : firstDog ? (
        <form action={startWalkAction.bind(null, firstDog.dogId)}>
          <button
            type="submit"
            className="relative flex flex-col items-center justify-center w-64 h-64 rounded-full bg-[#2A9D8F] shadow-2xl shadow-[#2A9D8F]/40 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
          >
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
              <PawPrint size={40} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-white">יוצאים לסיבוב?</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}
