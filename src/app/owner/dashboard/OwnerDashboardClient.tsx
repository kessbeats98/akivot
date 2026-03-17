"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { SlideOver } from "@/components/ui/slide-over";
import type { DogWithWalkers } from "@/lib/repositories/dogsRepo";

interface Props {
  dogs: DogWithWalkers[];
  availableWalkers: { id: string; displayName: string }[];
  createDogAction: (formData: FormData) => Promise<void>;
  deactivateDogAction: (dogId: string, formData: FormData) => Promise<void>;
  assignWalkerAction: (dogId: string, formData: FormData) => Promise<void>;
  setPriceAction: (dogWalkerId: string, formData: FormData) => Promise<void>;
  notificationsButton: ReactNode;
}

export function OwnerDashboardClient({
  dogs,
  availableWalkers,
  createDogAction,
  deactivateDogAction,
  assignWalkerAction,
  setPriceAction,
  notificationsButton,
}: Props) {
  const [isAddDogOpen, setIsAddDogOpen] = useState(false);
  const firstDog = dogs[0];

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">
            {firstDog ? "העקבות של" : "הכלבים שלי"}
          </p>
          <h1 className="text-4xl font-black text-dark tracking-tight">
            {firstDog?.name ?? "ברוך הבא"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {notificationsButton}
          {firstDog && (
            <Link
              href={`/owner/dog-profile/${firstDog.id}`}
              className="w-16 h-16 rounded-full p-1 bg-white shadow-glass border border-brand/10 flex items-center justify-center transition-transform active:scale-95"
            >
              <div className="w-full h-full rounded-full bg-brand-light flex items-center justify-center text-brand">
                <span className="font-bold text-xl">{firstDog.name.charAt(0)}</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Dog Status */}
      <section className="px-6 mb-8 mt-4">
        <div className="bg-white rounded-organic p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
            <span className="material-symbols-rounded">home</span>
          </div>
          <div>
            <h3 className="font-bold text-dark">
              {firstDog ? `${firstDog.name} בבית` : "אין כלבים עדיין"}
            </h3>
            <p className="text-xs text-gray-400">
              {firstDog ? "לא בטיול כרגע" : "הוסף את הכלב הראשון שלך"}
            </p>
          </div>
        </div>
      </section>

      {/* Dog List */}
      {dogs.length > 0 && (
        <section className="px-6 mb-8">
          <h3 className="text-lg font-bold text-dark mb-4">הכלבים שלי</h3>
          <div className="flex flex-col gap-3">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-[2rem] p-5 shadow-glass border border-white/60"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/owner/dog-profile/${dog.id}`} className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
                      <span className="font-bold text-lg">{dog.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{dog.name}</h4>
                      {dog.breed && <p className="text-xs text-gray-400">{dog.breed}</p>}
                    </div>
                  </Link>
                  <form action={deactivateDogAction.bind(null, dog.id)}>
                    <button
                      type="submit"
                      className="text-xs text-danger hover:underline font-medium"
                    >
                      הסר
                    </button>
                  </form>
                </div>

                {/* Walkers */}
                {dog.walkers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {dog.walkers.map((w) => (
                      <div
                        key={w.dogWalkerId}
                        className="flex items-center justify-between bg-surface rounded-2xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-rounded text-brand text-sm">
                            directions_walk
                          </span>
                          <span className="text-sm font-medium text-dark">{w.displayName}</span>
                        </div>
                        <form
                          action={setPriceAction.bind(null, w.dogWalkerId)}
                          className="flex gap-2 items-center"
                        >
                          <input
                            name="price"
                            placeholder="מחיר ₪"
                            required
                            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm w-20 text-center font-numbers outline-none focus:border-brand"
                          />
                          <button
                            type="submit"
                            className="text-xs bg-brand text-white px-3 py-1.5 rounded-xl font-bold"
                          >
                            קבע
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assign Walker */}
                <form
                  action={assignWalkerAction.bind(null, dog.id)}
                  className="flex gap-2"
                >
                  <select
                    name="walkerProfileId"
                    required
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand bg-white"
                  >
                    <option value="">בחר דוגווקר...</option>
                    {availableWalkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.displayName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-brand-light text-brand px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    שייך
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsAddDogOpen(true)}
            className="bg-brand text-white rounded-[2rem] p-5 shadow-glow-brand flex flex-col items-center gap-2 transition-transform active:scale-95"
          >
            <span className="material-symbols-rounded text-2xl">add</span>
            <span className="text-sm font-bold">הוסף כלב</span>
          </button>
          <Link
            href="/owner/billing"
            className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm flex flex-col items-center gap-2 transition-transform active:scale-95"
          >
            <span className="material-symbols-rounded text-2xl text-brand">
              account_balance_wallet
            </span>
            <span className="text-sm font-bold text-dark">תשלומים</span>
          </Link>
        </div>
      </section>

      {/* Add Dog SlideOver */}
      <SlideOver
        isOpen={isAddDogOpen}
        onClose={() => setIsAddDogOpen(false)}
        title="הוספת כלב חדש"
      >
        <form action={createDogAction} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">שם הכלב *</label>
            <input
              name="name"
              required
              type="text"
              placeholder="למשל: בונו"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">גזע</label>
            <input
              name="breed"
              type="text"
              placeholder="למשל: גולדן רטריבר"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">תאריך לידה</label>
            <input
              name="birthDate"
              type="date"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand font-numbers"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">הערות</label>
            <textarea
              name="notes"
              placeholder="אלרגיות, התנהגות מיוחדת..."
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand min-h-[100px] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 mt-4"
          >
            הוסף כלב
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
