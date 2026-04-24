'use client';
import { useEffect, useState, useRef } from 'react';
import { differenceInSeconds } from 'date-fns';
import { SlideOver } from '@/components/ui/slide-over';
import { Camera, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { endWalkFromLiveAction } from './actions';

export default function WalkerLive() {
  const [startedAt] = useState<Date>(() => new Date(Date.now() - 14 * 60 * 1000 - 23 * 1000));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock walkId for now
  const walkId = 'mock-walk-id';

  useEffect(() => {
    document.body.className = "text-dark antialiased min-h-screen bg-live font-sans pb-32";
    const updateTimer = () => setElapsedSeconds(differenceInSeconds(new Date(), startedAt));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => {
      document.body.className = "text-dark antialiased min-h-screen bg-default font-sans pb-32";
      clearInterval(interval);
    };
  }, [startedAt]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    if (hours > 0) return { main: `${pad(hours)}:${pad(minutes)}`, sub: `:${pad(seconds)}` };
    return { main: `${pad(minutes)}`, sub: `:${pad(seconds)}` };
  };

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
        setPhotos(prev => [url, ...prev]);
      } else {
        // Fallback for mock environment
        const mockPhoto = URL.createObjectURL(file);
        setPhotos(prev => [mockPhoto, ...prev]);
      }
    } catch (error) {
      console.error('Upload failed', error);
      // Fallback for mock environment
      const mockPhoto = URL.createObjectURL(file);
      setPhotos(prev => [mockPhoto, ...prev]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFinishWalk = async () => {
    await endWalkFromLiveAction(walkId);
    window.location.href = '/walker/dashboard';
  };

  const time = formatTime(elapsedSeconds);

  return (
    <div className="flex flex-col relative overflow-hidden text-white min-h-[calc(100vh-2.5rem)] -mt-10 animate-in fade-in duration-300">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span>
          <span className="text-accent text-sm font-bold tracking-wide">מקליט מסלול...</span>
        </div>
        <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50">
          <span className="material-symbols-rounded text-xl">more_vert</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-10">
        <div className="absolute w-64 h-64 border-[3px] border-brand/20 rounded-full animate-pulse-ring"></div>
        <div className="absolute w-80 h-80 border border-brand/10 rounded-full animate-pulse-ring" style={{ animationDelay: '-1.5s' }}></div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <p className="text-brand/80 font-bold mb-2">זמן פעילות</p>
          <h1 className="text-7xl font-black font-numbers tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {time.main}<span className="text-white/50 text-5xl">{time.sub}</span>
          </h1>
        </div>

        <div className="mt-12 flex justify-center items-center">
          <div className="flex -space-x-4 space-x-reverse relative z-10">
            <img className="w-14 h-14 rounded-full border-4 border-dark object-cover" src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" alt="Dog" />
            <img className="w-14 h-14 rounded-full border-4 border-dark object-cover" src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80" alt="Dog" />
            <div className="w-14 h-14 rounded-full border-4 border-dark bg-brand flex items-center justify-center font-bold text-sm">+1</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/50 font-medium">בונו, לוסי ורקס בטיול</p>
      </main>

      <footer className="px-6 pb-10 pt-6 relative z-20">
        {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scroll mb-6 px-2">
            {photos.map((p, i) => (
              <img key={i} src={p} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" alt="Walk" />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-6 mb-8">
          <button 
            onClick={() => setIsFinishOpen(true)}
            className="flex flex-col items-center gap-2"
          >
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
            className={`flex flex-col items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}
          >
            <div className="w-16 h-16 rounded-[2rem] bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shadow-glow-brand">
              <Camera size={24} />
            </div>
            <span className="text-xs font-bold text-white/50">תמונה</span>
          </button>
        </div>

        <button 
          onClick={() => setIsFinishOpen(true)}
          className="w-full bg-accent hover:bg-[#d06e53] text-white rounded-full py-5 px-6 shadow-glow-live flex justify-between items-center transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><span className="material-symbols-rounded">stop</span></div>
          <span className="text-xl font-black">סיימנו, חזרנו הביתה</span>
          <div className="w-10"></div>
        </button>
      </footer>

      {/* Finish Walk SlideOver */}
      <SlideOver 
        isOpen={isFinishOpen} 
        onClose={() => setIsFinishOpen(false)} 
        title="סיכום טיול"
      >
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-dark mb-1">טיול מוצלח!</h3>
            <p className="text-gray-500 font-medium">בונו, לוסי ורקס נהנו מאוד.</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
              <div className="bg-surface rounded-2xl p-3">
                <p className="text-xs text-gray-400 mb-1">זמן כולל</p>
                <p className="font-black font-numbers text-dark text-lg">{time.main}{time.sub}</p>
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
              onChange={e => setNote(e.target.value)}
              placeholder="איך היה הטיול? (למשל: עשינו צרכים, פגשנו חברים...)"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand min-h-[120px] resize-none"
            />
          </div>

          <div className="p-4 bg-surface rounded-2xl flex items-center gap-3">
            <MapPin size={20} className="text-brand" />
            <p className="text-xs text-gray-500 font-medium">המסלול נשמר וישותף עם הבעלים באופן אוטומטי.</p>
          </div>

          <button 
            onClick={handleFinishWalk}
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl text-center shadow-glow-brand transition-transform active:scale-95"
          >
            שלח סיכום וסיים
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

