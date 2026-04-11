"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { he } from "date-fns/locale";
import { SlideOver } from "@/components/ui/slide-over";
import type { DogWithWalkers, DogStats } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem, WalkStatus } from "@/lib/services/walks/types";

interface Props {
  dog: DogWithWalkers;
  walkHistory: DogWalkHistoryItem[];
  stats: DogStats;
  availableWalkers: { id: string; displayName: string }[];
  updateDogAction: (formData: FormData) => Promise<void>;
  assignWalkerAction: (formData: FormData) => Promise<void>;
  setPriceActions: Record<string, (formData: FormData) => Promise<void>>;
}

const STATUS_BADGE: Record<WalkStatus, { label: string; cls: string }> = {
  PLANNED: { label: "מתוכנן", cls: "bg-gray-100 text-gray-600" },
  LIVE: { label: "בטיול", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "הושלם", cls: "bg-brand-light text-brand" },
  AUTO_CLOSED: { label: "נסגר", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "בוטל", cls: "bg-red-100 text-red-600" },
};

function formatAge(birthDate: string | null): string {
  if (!birthDate) return "";
  const bd = new Date(birthDate);
  const years = differenceInYears(new Date(), bd);
  if (years >= 1) return `${years} שנים`;
  const months = differenceInMonths(new Date(), bd);
  return `${months} חודשים`;
}

const formatCurrency = (amount: string | null) => {
  if (!amount) return "";
  const n = Number(amount);
  const hasCents = n % 1 !== 0;
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
};

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} דק'`;
  const hours = (totalMinutes / 60).toFixed(1).replace(/\.0$/, "");
  return `${hours} שע'`;
}

export function DogProfileClient({ dog, walkHistory, stats, availableWalkers, updateDogAction, assignWalkerAction, setPriceActions }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(dog.imageUrl);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const age = formatAge(dog.birthDate);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("dogId", dog.id);
    form.append("file", file);
    const res = await fetch("/api/uploads/dog-image", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      setAvatarUrl(url);
    }
  }

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      {/* Back + Header */}
      <header className="px-6 pt-6 pb-2">
        <Link
          href="/owner/dashboard"
          className="flex items-center gap-1 text-brand font-medium text-sm mb-4"
        >
          <span className="material-symbols-rounded text-lg">arrow_forward</span>
          חזרה
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 mb-4">
        <div className="bg-gradient-to-b from-brand/10 to-transparent rounded-[2rem] p-8 flex flex-col items-center">
          {/* Avatar with upload overlay */}
          <div
            className="relative group w-24 h-24 rounded-full bg-brand-light flex items-center justify-center text-brand shadow-lg border-4 border-white mb-4 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={dog.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-black text-4xl">{dog.name.charAt(0)}</span>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-rounded text-white text-2xl">photo_camera</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <h1 className="text-3xl font-black text-dark mb-1">{dog.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {dog.breed && <span>{dog.breed}</span>}
            {dog.breed && age && <span>•</span>}
            {age && <span>{age}</span>}
          </div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-4 px-6 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold text-dark shadow-sm transition-transform active:scale-95"
          >
            <span className="material-symbols-rounded text-sm align-middle ml-1">edit</span>
            עריכה
          </button>
        </div>
      </section>

      {/* Stats Row */}
      {stats.totalWalks > 0 && (
        <section className="px-6 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-around text-center">
            <div>
              <p className="text-xl font-black text-brand font-numbers">{stats.totalWalks}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">טיולים</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xl font-black text-brand font-numbers">{formatMinutes(stats.totalMinutes)}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">סה"כ זמן</p>
            </div>
            {stats.favoriteWalkerName && (
              <>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex-1 px-2">
                  <p className="text-sm font-black text-brand truncate">{stats.favoriteWalkerName}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">מוביל</p>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Dog Notes */}
      {dog.notes && (
        <section className="px-6 mb-6">
          <div className="bg-white rounded-[2rem] p-5 shadow-glass border border-white/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-rounded text-brand">description</span>
              <h3 className="font-bold text-dark">הערות</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{dog.notes}</p>
          </div>
        </section>
      )}

      {/* Walkers */}
      <section className="px-6 mb-6">
        <h3 className="font-bold text-lg text-dark mb-3">דוגווקרים</h3>
        {dog.walkers.length > 0 ? (
          <div className="flex flex-col gap-2 mb-4">
            {dog.walkers.map((w) => {
              const priceIsZero = !w.currentPrice || w.currentPrice === "0.00";
              const setPriceAction = setPriceActions[w.dogWalkerId];
              return (
                <div
                  key={w.dogWalkerId}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
                      <span className="material-symbols-rounded text-lg">directions_walk</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-dark text-sm">{w.displayName}</p>
                      <p className="text-[11px] text-gray-400">
                        {w.isActive ? "פעיל" : "לא פעיל"}
                        {!priceIsZero && (
                          <span className="mr-2 text-brand font-numbers">{formatCurrency(w.currentPrice)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {w.isActive && setPriceAction && (
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-amber-100">
                      {!priceIsZero && (
                        <p className="text-[11px] text-amber-600 text-right">
                          שינוי מחיר ישפיע על טיולים שלא שולמו
                        </p>
                      )}
                      <form action={setPriceAction} className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-amber-500 text-base">payments</span>
                        <input
                          type="number"
                          name="price"
                          required
                          min="0.01"
                          step="0.01"
                          defaultValue={priceIsZero ? "" : w.currentPrice ?? ""}
                          placeholder="מחיר לטיול (₪)"
                          className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
                        >
                          {priceIsZero ? "קבע מחיר" : "עדכן מחיר"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">אין דוגווקרים משויכים עדיין</p>
        )}

        {/* Assign new walker */}
        {availableWalkers.length > 0 && (
          <form action={assignWalkerAction} className="flex items-center gap-2">
            <select
              name="walkerProfileId"
              required
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">בחר דוגווקר</option>
              {availableWalkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.displayName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-colors whitespace-nowrap"
            >
              שיוך
            </button>
          </form>
        )}
      </section>

      {/* Diary */}
      <section className="px-6 mb-8">
        <h3 className="font-bold text-lg text-dark mb-4">יומן טיולים</h3>
        {walkHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
            {walkHistory.map((walk) => {
              const badge = STATUS_BADGE[walk.status];
              return (
                <div
                  key={walk.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start p-4 pb-3">
                    <div>
                      <p className="font-bold text-dark text-sm">
                        {format(new Date(walk.startTime), "EEEE, d בMMMM", { locale: he })}
                      </p>
                      <p className="text-xs text-gray-400 font-numbers mt-0.5">
                        {format(new Date(walk.startTime), "HH:mm")}
                        {walk.endTime && ` — ${format(new Date(walk.endTime), "HH:mm")}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Walker + duration */}
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="material-symbols-rounded text-sm">directions_walk</span>
                      <span>{walk.walkerName}</span>
                      {walk.durationMinutes != null && (
                        <span className="font-numbers bg-gray-100 px-2 py-0.5 rounded-full">
                          {walk.durationMinutes} דק'
                        </span>
                      )}
                    </div>
                    {walk.finalPrice && (
                      <span className="font-bold font-numbers text-brand text-sm">
                        {formatCurrency(walk.finalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Walk note */}
                  {walk.note && (
                    <div className="mx-4 mb-3 bg-amber-50 rounded-xl px-3 py-2 flex gap-2 items-start">
                      <span className="material-symbols-rounded text-amber-500 text-sm mt-0.5">edit_note</span>
                      <p className="text-xs text-amber-800 italic leading-relaxed">{walk.note}</p>
                    </div>
                  )}

                  {/* Photo strip */}
                  {walk.mediaPhotos.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {walk.mediaPhotos.map((photo) => {
                          const src = `/api/media/walk-photo?key=${encodeURIComponent(photo.storageKey)}`;
                          return (
                            <button
                              key={photo.id}
                              onClick={() => setLightboxSrc(src)}
                              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100"
                            >
                              <img
                                src={src}
                                alt="תמונה מהטיול"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-brand/5 rounded-[2rem] p-8 flex flex-col items-center gap-2">
            <span className="material-symbols-rounded text-brand/40 text-3xl">directions_walk</span>
            <p className="text-gray-500 text-sm">אין טיולים עדיין</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="תמונה מהטיול"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-6 right-6 text-white"
          >
            <span className="material-symbols-rounded text-3xl">close</span>
          </button>
        </div>
      )}

      {/* Edit SlideOver */}
      <SlideOver isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="עריכת פרופיל">
        <form action={updateDogAction} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">שם הכלב</label>
            <input
              name="name"
              type="text"
              defaultValue={dog.name}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">גזע</label>
            <input
              name="breed"
              type="text"
              defaultValue={dog.breed ?? ""}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">תאריך לידה</label>
            <input
              name="birthDate"
              type="date"
              defaultValue={dog.birthDate ?? ""}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand font-numbers"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">הערות</label>
            <textarea
              name="notes"
              defaultValue={dog.notes ?? ""}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand min-h-[100px] resize-none"
            />
          </div>
          <button
            type="submit"
            onClick={() => setIsEditOpen(false)}
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 mt-4"
          >
            שמור שינויים
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
