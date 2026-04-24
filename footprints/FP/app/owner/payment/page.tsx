'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Receipt, CheckCircle2, Clock, History, ExternalLink, ArrowRight } from 'lucide-react';

export default function OwnerPayment() {
  const [isPaid, setIsPaid] = useState(false);

  const handleBitPayment = () => {
    // Simulate Bit payment
    alert('מעבר לאפליקציית Bit...');
    setIsPaid(true);
  };

  if (isPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">התשלום הועבר!</h1>
        <p className="text-gray-500 font-medium mb-10">תודה רבה! דני קיבל עדכון על התשלום.</p>
        <Link 
          href="/owner"
          className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95"
        >
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10">
        <Link href="/owner" className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-dark transition-transform active:scale-95">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-xl font-bold text-dark tracking-tight">סיכום חשבון</h1>
        <div className="w-12"></div>
      </header>

      <section className="px-6 mb-8 mt-2">
        <div className="relative overflow-hidden bg-brand rounded-[2.5rem] p-8 shadow-glow-brand text-white border border-white/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-sm">
              <Receipt size={32} />
            </div>
            <p className="text-brand-light/80 font-medium mb-1">סה״כ לתשלום לדני</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-6xl font-black font-numbers tracking-tighter text-white">600</span>
              <span className="text-3xl font-bold text-white/80">₪</span>
            </div>
            <p className="text-xs text-white/60 font-medium">עבור 12 טיולים במרץ</p>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-brand" />
          <h3 className="text-lg font-bold text-dark">פירוט טיולים אחרונים</h3>
        </div>
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-glass border border-white">
          {[
            { date: '12.03', type: 'טיול צהריים', duration: '45 דק׳', price: 50 },
            { date: '10.03', type: 'טיול בוקר', duration: '45 דק׳', price: 50 },
            { date: '08.03', type: 'טיול צהריים', duration: '45 דק׳', price: 50 },
            { date: '05.03', type: 'טיול בוקר', duration: '45 דק׳', price: 50 },
          ].map((walk, i) => (
            <div key={i} className={`flex justify-between items-center p-4 ${i !== 3 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-brand font-numbers font-bold text-sm">
                  {walk.date.split('.')[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-dark">{walk.type}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{walk.date} • {walk.duration}</p>
                </div>
              </div>
              <span className="font-black font-numbers text-dark">{walk.price} ₪</span>
            </div>
          ))}
          <button className="w-full py-4 text-brand text-xs font-bold bg-surface/50 hover:bg-surface transition-colors">
            הצג את כל 12 הטיולים
          </button>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-gray-400" />
          <h3 className="text-lg font-bold text-dark">היסטוריית תשלומים</h3>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-dark">פברואר 2026</p>
              <p className="text-[10px] text-gray-400 font-medium">שולם ב-02.03.26</p>
            </div>
          </div>
          <p className="font-black font-numbers text-dark">550 ₪</p>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-[#F7F9F9] via-[#F7F9F9]/90 to-transparent">
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleBitPayment}
            className="w-full bg-bit text-white rounded-2xl py-5 px-6 font-black text-xl shadow-glow-bit transition-transform active:scale-95 flex justify-center items-center gap-3"
          >
            שלם ב-Bit
            <ExternalLink size={20} />
          </button>
          <button 
            onClick={() => setIsPaid(true)}
            className="w-full bg-white border-2 border-brand/20 text-brand rounded-2xl py-4 px-6 font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <CheckCircle2 size={20} />
            <span>העברתי בדרך אחרת, עדכן את דני</span>
          </button>
        </div>
      </div>
    </div>
  );
}

