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
    <div className="w-full flex items-center justify-center py-8">
      {isEmpty ? (
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-full bg-neutral-200 shadow-inner flex flex-col items-center justify-center">
          <PawPrint size={56} className="text-neutral-400 mb-3" />
          <span className="text-sm font-medium text-neutral-500 text-center px-8">
            אין כלבים משויכים
          </span>
        </div>
      ) : firstDog ? (
        <div className="relative w-full max-w-sm mx-auto">
          {/* Glow behind circle */}
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <form action={startWalkAction.bind(null, firstDog.dogId)}>
            <button
              type="submit"
              className="relative w-full aspect-square rounded-full bg-primary shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 flex flex-col items-center justify-center"
            >
              <div className="bg-white/20 p-6 rounded-full mb-4">
                <PawPrint size={64} className="text-white" />
              </div>
              <span className="text-3xl font-bold text-white">יוצאים לסיבוב?</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
