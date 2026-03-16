"use client";

import { useEffect, useState, useRef } from "react";
import { differenceInSeconds } from "date-fns";
import { SlideOver } from "@/components/ui/slide-over";
import { Camera, FileText, CheckCircle2, MapPin } from "lucide-react";

interface Props {
  walkId: string;
  dogName: string;
  startTime: string; // ISO string
  endWalkAction: (walkId: string, formData: FormData) => Promise<void>;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function WalkerLiveClient({ walkId, dogName, startTime, endWalkAction }: Props) {
  const startDate = new Date(startTime);
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    differenceInSeconds(new Date(), startDate),
  );
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(differenceInSeconds(new Date(), startDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const timeMain = hours > 0 ? `${pad(hours)}:${pad(minutes)}` : pad(minutes);
  const timeSub = `:${pad(seconds)}`;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("walkId", walkId);
      formData.append("capturedAt", new Date().toISOString());
      formData.append("file", file);

      const res = await fetch("/api/uploads/walk-media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setPhotos((prev) => [url, ...prev]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFinishWalk = async () => {
    setIsEnding(true);
    try {
      const fd = new FormData();
      await endWalkAction(walkId, fd);
      // endWalkAction calls redirect("/walker/dashboard")
    } catch {
      setIsEnding(false);
    }
  };

  return (
    <div className="flex flex-col relative overflow-hidden text-white min-h-screen bg-live">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          <span className="text-accent text-sm font-bold tracking-wide">מקליט מסלול...</span>
        </div>
        <span className="text-white/50 text-sm font-medium">{dogName}</span>
      </header>

      {/* Timer */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-10">
        <div className="absolute w-64 h-64 border-[3px] border-brand/20 rounded-full animate-pulse-ring" />
        <div
          className="absolute w-80 h-80 border border-brand/10 rounded-full animate-pulse-ring"
          style={{ animationDelay: "-1.5s" }}
        />

        <div className="relative z-10 text-center flex flex-col items-center">
          <p className="text-brand/80 font-bold mb-2">זמן פעילות</p>
          <h1 className="text-7xl font-black font-numbers tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {timeMain}
            <span className="text-white/50 text-5xl">{timeSub}</span>
          </h1>
        </div>

        <p className="mt-12 text-sm text-white/50 font-medium">
          בטיול עם {dogName}
        </p>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-6 relative z-20">
        {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scroll mb-6 px-2">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                alt="Walk"
              />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-6 mb-8">
          <button onClick={() => setIsFinishOpen(true)} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-[2rem] bg-surface/50 border border-white/10 flex items-center justify-center text-white">
              <FileText size={24} />
            </div>
            <span className="text-xs font-bold text-white/50">הערה</span>
          </button>

          <input
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex flex-col items-center gap-2 ${isUploading ? "opacity-50" : ""}`}
          >
            <div className="w-16 h-16 rounded-[2rem] bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shadow-glow-brand">
              <Camera size={24} />
            </div>
            <span className="text-xs font-bold text-white/50">
              {isUploading ? "מעלה..." : "תמונה"}
            </span>
          </button>
        </div>

        <button
          onClick={() => setIsFinishOpen(true)}
          className="w-full bg-accent hover:bg-accent/90 text-white rounded-full py-5 px-6 shadow-glow-live flex justify-between items-center transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-rounded">stop</span>
          </div>
          <span className="text-xl font-black">סיימנו, חזרנו הביתה</span>
          <div className="w-10" />
        </button>
      </footer>

      {/* Finish Walk SlideOver */}
      <SlideOver isOpen={isFinishOpen} onClose={() => setIsFinishOpen(false)} title="סיכום טיול">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-dark mb-1">טיול מוצלח!</h3>
            <p className="text-gray-500 font-medium">{dogName} נהנה מאוד.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
              <div className="bg-surface rounded-2xl p-3">
                <p className="text-xs text-gray-400 mb-1">זמן כולל</p>
                <p className="font-black font-numbers text-dark text-lg">
                  {timeMain}{timeSub}
                </p>
              </div>
              <div className="bg-surface rounded-2xl p-3">
                <p className="text-xs text-gray-400 mb-1">תמונות</p>
                <p className="font-black font-numbers text-dark text-lg">{photos.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1 flex items-center gap-2">
              <FileText size={16} />
              הערה לבעלים
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="איך היה הטיול? (למשל: עשינו צרכים, פגשנו חברים...)"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand min-h-[120px] resize-none text-dark"
            />
          </div>

          <div className="p-4 bg-surface rounded-2xl flex items-center gap-3">
            <MapPin size={20} className="text-brand" />
            <p className="text-xs text-gray-500 font-medium">
              המסלול נשמר וישותף עם הבעלים באופן אוטומטי.
            </p>
          </div>

          <button
            onClick={handleFinishWalk}
            disabled={isEnding}
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl text-center shadow-glow-brand transition-transform active:scale-95 disabled:opacity-50"
          >
            {isEnding ? "מסיים..." : "שלח סיכום וסיים"}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}
