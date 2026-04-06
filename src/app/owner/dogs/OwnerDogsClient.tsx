"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DogWithWalkers } from "@/lib/repositories/dogsRepo";
import { createDogAction } from "@/app/owner/dashboard/actions";

interface Props {
  dogs: DogWithWalkers[];
}

export function OwnerDogsClient({ dogs }: Props) {
  const router = useRouter();

  async function handleAdd(formData: FormData) {
    await createDogAction(formData);
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {/* Topbar */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
        <div className="text-[22px] font-extrabold text-brand tracking-tight">הכלבים שלי</div>
        <Link href="/owner/dashboard" className="flex items-center gap-1 text-brand font-medium text-sm">
          <span className="material-symbols-rounded text-base">chevron_right</span>
          חזרה
        </Link>
      </div>

      <div className="flex-1 px-6 pb-24 flex flex-col gap-5">
        {/* Add dog form — always visible */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col gap-3">
          <div className="text-sm font-bold text-dark">הוספת כלב</div>
          <form action={handleAdd} className="flex items-center gap-2">
            <input
              type="text"
              name="name"
              required
              placeholder="שם הכלב"
              className="flex-1 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
            >
              הוספה
            </button>
          </form>
        </div>

        {/* Dogs list */}
        {dogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="text-[48px]">🐾</div>
            <div className="text-base font-semibold text-dark">הוסף את הכלב הראשון</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dogs.map((dog) => {
              const activeWalkers = dog.walkers.filter((w) => w.isActive);
              return (
                <Link
                  key={dog.id}
                  href={`/owner/dog-profile/${dog.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-xl flex-shrink-0">
                    {dog.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dog.imageUrl}
                        alt={dog.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "🐕"
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-dark truncate">{dog.name}</div>
                    {dog.breed && (
                      <div className="text-xs text-muted-color truncate">{dog.breed}</div>
                    )}
                    <div className="text-xs text-muted-color mt-0.5">
                      {activeWalkers.length === 0
                        ? "אין מטיילים מוקצים"
                        : activeWalkers.length === 1
                        ? "מטייל 1"
                        : `${activeWalkers.length} מטיילים`}
                    </div>
                  </div>

                  {/* Chevron */}
                  <span className="material-symbols-rounded text-gray-300 text-xl">
                    chevron_left
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
