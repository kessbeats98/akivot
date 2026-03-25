"use client";

import type { DogWithWalkers } from "@/lib/repositories/dogsRepo";

interface Props {
  dogs: DogWithWalkers[];
  selectedDogId: string;
  liveWalkDogIds: Set<string>;
  onSelect: (id: string) => void;
}

export function OwnerDogSelector({ dogs, selectedDogId, liveWalkDogIds, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
      {dogs.map((dog) => {
        const isLive = liveWalkDogIds.has(dog.id);
        const isSelected = dog.id === selectedDogId;
        return (
          <button
            key={dog.id}
            onClick={() => onSelect(dog.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? "ring-2 ring-brand ring-offset-2"
                  : isLive
                  ? "ring-2 ring-[#4ade80] ring-offset-2"
                  : "ring-1 ring-[var(--border)]"
              }`}
            >
              {dog.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dog.imageUrl}
                  alt={dog.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold text-base">
                  {dog.name.charAt(0)}
                </div>
              )}
            </div>
            <span className={`text-[11px] font-semibold max-w-[56px] truncate ${
              isSelected ? "text-brand-dark" : "text-muted-color"
            }`}>
              {dog.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
