'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SlideOver } from '@/components/ui/slide-over';
import type { AssignedDog, WalkWithDog } from '@/lib/services/walks/types';

interface WalkerDashboardClientProps {
  assignedDogs: AssignedDog[];
  activeWalks: WalkWithDog[];
  onStartWalk: (dogId: string) => Promise<void>;
}

export function WalkerDashboardClient({ assignedDogs, activeWalks, onStartWalk }: WalkerDashboardClientProps) {
  const [isStartWalkOpen, setIsStartWalkOpen] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const toggleDog = (dogId: string) => {
    setSelectedDogs(prev => 
      prev.includes(dogId) ? prev.filter(id => id !== dogId) : [...prev, dogId]
    );
  };

  const handleStartWalk = async () => {
    if (selectedDogs.length > 0) {
      setIsStarting(true);
      try {
        await onStartWalk(selectedDogs[0]); // V1 only supports one dog per walk
        window.location.href = '/walker/live';
      } catch (error) {
        console.error('Failed to start walk', error);
        setIsStarting(false);
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-6 flex justify-between items-center z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">בוקר טוב 👋</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">המסלול שלך</h1>
        </div>
        <div className="w-14 h-14 rounded-full p-1 bg-white shadow-glass border border-brand/10 flex items-center justify-center text-brand">
          <span className="material-symbols-rounded text-2xl">person</span>
        </div>
      </header>

      {activeWalks.length > 0 && (
        <section className="px-6 mb-4">
          <Link href="/walker/live" className="block bg-accent text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded animate-pulse">directions_run</span>
              <div>
                <h3 className="font-bold">טיול פעיל עכשיו</h3>
                <p className="text-sm opacity-90">עם {activeWalks[0].dogName}</p>
              </div>
            </div>
            <span className="material-symbols-rounded">chevron_left</span>
          </Link>
        </section>
      )}

      <section className="px-6 mb-8 mt-2">
        <button 
          onClick={() => setIsStartWalkOpen(true)}
          className="w-full text-right block relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20 transition-transform active:scale-[0.98]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <span className="material-symbols-rounded text-3xl">directions_walk</span>
              </div>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {assignedDogs.length} כלבים ממתינים
              </span>
            </div>
            <h2 className="text-3xl font-black mb-2">יוצאים לסיבוב?</h2>
            <p className="text-brand-light/80 font-medium">לחץ כאן כדי לבחור כלבים ולהתחיל טיול.</p>
          </div>
        </button>
      </section>

      <section className="mb-10">
        <div className="px-6 flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-dark">הלקוחות שלך</h3>
          <Link href="/walker/calendar" className="text-sm font-bold text-brand hover:opacity-70">ראה יומן</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scroll px-6 pb-4 pt-2">
          {assignedDogs.length > 0 ? (
            assignedDogs.map(dog => (
              <div key={dog.dogId} className="min-w-[120px] bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 flex flex-col items-center gap-3 relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                  <span className="material-symbols-rounded text-3xl">pets</span>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-dark text-sm">{dog.dogName}</h4>
                  {dog.dogBreed && <p className="text-xs text-gray-400 font-medium">{dog.dogBreed}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 w-full text-gray-500">
              אין כלבים משויכים כרגע.
            </div>
          )}
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
            {assignedDogs.map(dog => (
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
            {assignedDogs.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                אין כלבים משויכים.
              </div>
            )}
          </div>

          <button 
            onClick={handleStartWalk}
            disabled={selectedDogs.length === 0 || isStarting}
            className={`w-full py-5 rounded-2xl font-black text-xl text-center transition-all ${
              selectedDogs.length > 0 && !isStarting
                ? 'bg-brand text-white shadow-glow-brand' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isStarting ? 'מתחיל טיול...' : 'צא לדרך!'}
          </button>
        </div>
      </SlideOver>
    </div>
  );
}
