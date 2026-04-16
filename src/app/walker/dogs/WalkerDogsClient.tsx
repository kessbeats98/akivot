"use client";

import { useState } from "react";
import type { AssignedDog } from "@/lib/services/walks/types";

interface Props {
  assignedDogs: AssignedDog[];
}

const formatPrice = (price: string, currency: string) =>
  currency === "ILS" ? `${price} ₪` : `${price} ${currency}`;

export function WalkerDogsClient({ assignedDogs }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = assignedDogs.filter(
    (dog) =>
      dog.dogName.includes(searchQuery) ||
      (dog.dogBreed && dog.dogBreed.includes(searchQuery)) ||
      (dog.ownerName && dog.ownerName.includes(searchQuery)),
  );

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Header */}
      <header className="px-6 pt-4 pb-3 flex justify-between items-end z-10">
        <div>
          <h1 className="text-xl font-semibold text-dark tracking-tight">הלהקה שלי</h1>
        </div>
      </header>

      {/* Search */}
      {assignedDogs.length > 0 && (
        <section className="px-6 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="חיפוש כלב..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 text-dark rounded-xl py-2.5 px-5 pr-12 outline-none focus:border-brand transition-colors"
            />
            <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
        </section>
      )}

      {/* Dog List */}
      <section className="px-6 mb-8 flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((dog) => (
            <div
              key={dog.dogWalkerId}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
                  <span className="font-bold text-base">{dog.dogName.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-dark text-base mb-0.5">{dog.dogName}</h4>
                  {dog.dogBreed && (
                    <p className="text-xs text-gray-500 font-medium">{dog.dogBreed}</p>
                  )}
                  {dog.ownerName && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      <span className="material-symbols-rounded text-[12px] align-middle ml-0.5">person</span>
                      {dog.ownerName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dog.ownerPhone && (
                  <a
                    href={`tel:${dog.ownerPhone}`}
                    className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center transition-transform active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="material-symbols-rounded text-lg">call</span>
                  </a>
                )}
                <div className="text-left">
                  <p className="font-bold font-numbers text-brand text-sm">
                    {formatPrice(dog.currentPrice, dog.currency)}
                  </p>
                  <p className="text-[10px] text-gray-400">לטיול</p>
                </div>
              </div>
            </div>
          ))
        ) : assignedDogs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-2xl">pets</span>
            </div>
            <p className="text-dark font-semibold text-base mb-1">אין כלבים עדיין</p>
            <p className="text-gray-400 font-medium">כלבים יופיעו כאן אחרי שבעלים ישייכו אותך.</p>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <span className="material-symbols-rounded text-4xl mb-2 opacity-50">search_off</span>
            <p>לא נמצאו תוצאות ל&quot;{searchQuery}&quot;</p>
          </div>
        )}
      </section>
    </div>
  );
}
