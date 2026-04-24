'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlideOver } from '@/components/ui/slide-over';
import { getOwnerDogsAction } from './actions';
import { AssignedDog } from '@/lib/services/walks/types';

export default function OwnerDash() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [dogs, setDogs] = useState<AssignedDog[]>([]);
  
  useEffect(() => {
    async function load() {
      const data = await getOwnerDogsAction();
      setDogs(data);
    }
    load();
  }, []);

  const activeWalk = null; // Walk status should come from a different action or be part of dogs if expanded.
  const openPeriod = null; // Billing is moved to billing page.

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">העקבות של</p>
          <h1 className="text-4xl font-black text-dark tracking-tight">בונו</h1>
        </div>
        <Link href="/owner/dog-profile" className="w-16 h-16 rounded-full p-1 bg-white shadow-glass border border-brand/10 relative cursor-pointer block transition-transform active:scale-95">
          <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" className="w-full h-full rounded-full object-cover" alt="Bono" />
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${activeWalk ? 'bg-accent animate-soft-pulse' : 'bg-green-400'}`}></div>
        </Link>
      </header>

      {activeWalk ? (
        <section className="px-6 mb-8 mt-4">
          <div className="relative overflow-hidden bg-dark rounded-organic p-6 shadow-glow-live border border-white/10">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  <span className="text-accent text-xs font-bold tracking-wider uppercase">בשידור חי עכשיו</span>
                </div>
                <h2 className="text-white text-xl font-bold mb-1">טיול צהריים עם דני</h2>
                <p className="text-white/60 text-sm font-numbers">00:15:42</p>
              </div>
              <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded">image</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 mb-8 mt-4">
          <div className="bg-white rounded-organic p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <span className="material-symbols-rounded">home</span>
            </div>
            <div>
              <h3 className="font-bold text-dark">בונו בבית</h3>
              <p className="text-xs text-gray-400">הטיול הבא מתוכנן למחר ב-08:00</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mb-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-glass border border-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-dark">השבוע של בונו</h3>
            <Link href="/owner/calendar" className="w-8 h-8 bg-brand-light rounded-full text-brand flex items-center justify-center hover:bg-brand/20 transition-colors">
              <span className="material-symbols-rounded text-sm">calendar_month</span>
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { day: 'א\'', active: true, past: true },
              { day: 'ב\'', active: true, past: true },
              { day: 'ג\'', active: true, current: true },
              { day: 'ד\'', date: '18' },
              { day: 'ה\'', date: '19' },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-xs ${d.current ? 'font-bold text-dark' : 'text-gray-400'}`}>{d.day}</span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  d.current ? 'bg-accent text-white shadow-glow-live' : 
                  d.active ? 'bg-brand-light text-brand' : 
                  'border border-gray-100 font-numbers text-gray-300'
                }`}>
                  {d.active ? (
                    <span className="material-symbols-rounded text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                  ) : (
                    <span className="text-sm">{d.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6">
        <button 
          onClick={() => setIsPaymentOpen(true)}
          className="w-full text-right block bg-brand rounded-[2rem] p-6 shadow-glow-brand flex justify-between items-center relative overflow-hidden transition-transform active:scale-[0.98]"
        >
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-1">יתרה פתוחה לתשלום</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-numbers font-black text-white">150</span>
              <span className="text-white/80 font-bold">₪</span>
            </div>
          </div>
          <div className="relative z-10 bg-white text-brand px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
            שלם עכשיו
          </div>
        </button>
      </section>

      {/* Payment SlideOver */}
      <SlideOver 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        title="סיכום תשלום"
      >
        <div className="flex flex-col gap-6">
          <div className="bg-brand/5 rounded-3xl p-6 border border-brand/10 text-center">
            <p className="text-brand/60 text-sm font-bold mb-1">סה״כ לתשלום עבור מרץ</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black font-numbers text-brand">150</span>
              <span className="text-xl font-bold text-brand/80">₪</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-dark px-1">פירוט טיולים</h4>
            {[
              { date: '15.03', time: '14:00', price: 50 },
              { date: '14.03', time: '08:30', price: 50 },
              { date: '12.03', time: '15:15', price: 50 },
            ].map((walk, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-brand">
                    <span className="material-symbols-rounded text-xl">pets</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-dark">טיול צהריים</p>
                    <p className="text-xs text-gray-400 font-numbers">{walk.date} • {walk.time}</p>
                  </div>
                </div>
                <span className="font-bold font-numbers text-dark">{walk.price}₪</span>
              </div>
            ))}
          </div>

          <button 
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 flex items-center justify-center gap-3"
            onClick={() => {
              // Simulate payment
              alert('מעבר לאפליקציית Bit...');
              setIsPaymentOpen(false);
            }}
          >
            <span className="material-symbols-rounded">payments</span>
            שלם עם Bit
          </button>
        </div>
      </SlideOver>
    </div>
  );
}

