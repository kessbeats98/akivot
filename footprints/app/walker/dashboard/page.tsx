'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlideOver } from '@/components/ui/SlideOver';
import { getWalkerDashboardAction, startWalkAction } from './actions';
import { WalkerDashboardData } from '@/lib/services/walks/types';

export default function WalkerDash() {
  const [isStartWalkOpen, setIsStartWalkOpen] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<WalkerDashboardData | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getWalkerDashboardAction();
      setDashboardData(data);
    }
    load();
  }, []);

  const toggleDog = (dogId: string) => {
    setSelectedDogs(prev => 
      prev.includes(dogId) ? prev.filter(id => id !== dogId) : [...prev, dogId]
    );
  };

  const handleStartWalk = async () => {
    if (selectedDogs.length > 0) {
      await startWalkAction(selectedDogs[0]); // V1 only supports one dog per walk based on startWalkSchema: { dogId: UUID }
      window.location.href = '/walker/live';
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-6 flex justify-between items-center z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">בוקר טוב, דני 👋</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">המסלול שלך</h1>
        </div>
        <div className="w-14 h-14 rounded-full p-1 bg-white shadow-glass border border-brand/10">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Profile" className="w-full h-full rounded-full object-cover" />
        </div>
      </header>

      <section className="px-6 mb-8 mt-2">
        <button 
          onClick={() => setIsStartWalkOpen(true)}
          className="w-full text-right block relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20 transition-transform active:scale-[0.98]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"><span className="material-symbols-rounded text-3xl">directions_walk</span></div>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">3 כלבים ממתינים</span>
            </div>
            <h2 className="text-3xl font-black mb-2">יוצאים לסיבוב?</h2>
            <p className="text-brand-light/80 font-medium">לחץ כאן כדי לבחור כלבים ולהתחיל טיול.</p>
          </div>
        </button>
      </section>

      <section className="mb-10">
        <div className="px-6 flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-dark">הלקוחות של היום</h3>
          <Link href="/walker/calendar" className="text-sm font-bold text-brand hover:opacity-70">ראה יומן</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scroll px-6 pb-4 pt-2">
          <div className="min-w-[120px] bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 flex flex-col items-center gap-3 relative">
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
            <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" className="w-16 h-16 rounded-full object-cover shadow-sm" alt="Dog" />
            <div className="text-center"><h4 className="font-bold text-dark text-sm">בונו</h4><p className="text-xs text-gray-400 font-medium">14:00</p></div>
          </div>
          <div className="min-w-[120px] bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 flex flex-col items-center gap-3">
            <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80" className="w-16 h-16 rounded-full object-cover shadow-sm" alt="Dog" />
            <div className="text-center"><h4 className="font-bold text-dark text-sm">לוסי</h4><p className="text-xs text-gray-400 font-medium">15:30</p></div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <h3 className="text-lg font-bold text-dark mb-4">פסיעות אחרונות</h3>
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 border border-white shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center shrink-0"><span className="material-symbols-rounded">check</span></div>
          <div className="flex-1"><h4 className="font-bold text-sm text-dark">טיול הושלם - רקס</h4><p className="text-xs text-gray-500 font-numbers font-medium mt-0.5">09:15 - 10:00 • 45 דק&apos;</p></div>
          <div className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-full">שולם</div>
        </div>
      </section>

      {/* Start Walk SlideOver */}
      <SlideOver 
        isOpen={isStartWalkOpen} 
        onClose={() => setIsStartWalkOpen(false)} 
        title="בחירת כלבים לטיול"
      >
        <div className="flex flex-col gap-6">
          <p className="text-gray-500 font-medium">בחר את הכלבים שיוצאים איתך עכשיו לסיבוב:</p>
          
          <div className="grid grid-cols-2 gap-4">
            {dashboardData?.assignedDogs.map(dog => (
              <button
                key={dog.dogId}
                onClick={() => toggleDog(dog.dogId)}
                className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedDogs.includes(dog.dogId) 
                    ? 'border-brand bg-brand/5 shadow-md' 
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <span className="material-symbols-rounded">pets</span>
                </div>
                <span className={`font-bold ${selectedDogs.includes(dog.dogId) ? 'text-brand' : 'text-dark'}`}>
                  {dog.dogName}
                </span>
                {selectedDogs.includes(dog.dogId) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-rounded text-sm">check</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={handleStartWalk}
            disabled={selectedDogs.length === 0}
            className={`w-full py-5 rounded-2xl font-black text-xl text-center transition-all ${
              selectedDogs.length > 0 
                ? 'bg-brand text-white shadow-glow-brand' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            צא לדרך!
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

