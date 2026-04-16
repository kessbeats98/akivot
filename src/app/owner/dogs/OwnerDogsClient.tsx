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
        <div className="text-[15px] font-semibold text-muted-color tracking-tight">ניהול כלבים</div>
        <Link href="/owner/dashboard" className="flex items-center gap-1 text-brand font-medium text-sm">
          <span className="material-symbols-rounded text-base">chevron_right</span>
          בית
        </Link>
      </div>

      <div className="flex-1 px-6 pb-24 flex flex-col gap-4">
        {/* Add dog form — inline, lower visual weight */}
        <div className="border border-dashed border-gray-200 rounded-2xl px-4 py-3 flex flex-col gap-2">
          <form action={handleAdd} className="flex items-center gap-2">
            <input
              type="text"
              name="name"
              required
              placeholder="שם כלב חדש"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand bg-transparent"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              הוספה
            </button>
          </form>
        </div>

        {/* Dogs list */}
        {dogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="text-[36px]">🐾</div>
            <div className="text-sm text-muted-color">עדיין אין כלבים — הוסף את הראשון</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dogs.map((dog) => {
              const activeWalkers = dog.walkers.filter((w) => w.isActive);
              return (
                <Link
                  key={dog.id}
                  href={`/owner/dog-profile/${dog.id}`}
                  className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:border-gray-200 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-base flex-shrink-0">
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
                    <div className="text-[14px] font-semibold text-dark truncate">{dog.name}</div>
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
                  <span className="material-symbols-rounded text-gray-300 text-lg">
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
