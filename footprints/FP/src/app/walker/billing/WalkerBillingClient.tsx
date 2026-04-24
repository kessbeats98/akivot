'use client';
import { useState } from 'react';
import { SlideOver } from '@/components/ui/slide-over';
import { Receipt, Send, CheckCircle2, Phone, Calendar } from 'lucide-react';
import { PaymentPeriodWithEntries } from '@/lib/services/billing/types';

export function WalkerBillingClient({ initialPeriods }: { initialPeriods: PaymentPeriodWithEntries[] }) {
  const [periods, setPeriods] = useState<PaymentPeriodWithEntries[]>(initialPeriods);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriodWithEntries | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const totalOpen = periods.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(amount));
  };

  const handleSendReminder = (period: PaymentPeriodWithEntries) => {
    const message = `היי, זה דני הדוגווקר. רציתי להזכיר שיש תשלום פתוח על סך ${formatCurrency(period.totalAmount)}. תודה!`;
    window.open(`https://wa.me/0500000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-end z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">הכנסות ולקוחות</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">כספים</h1>
        </div>
        <button className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-dark transition-transform active:scale-95">
          <span className="material-symbols-rounded">search</span>
        </button>
      </header>

      <section className="px-6 mb-8 mt-2">
        <div className="relative overflow-hidden bg-brand rounded-organic p-8 shadow-glow-brand text-white border border-white/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-brand-light/80 font-medium mb-1">סה״כ פתוח לגבייה</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black font-numbers tracking-tighter">{formatCurrency(totalOpen)}</span>
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-xs text-white/60 mb-1">לקוחות פתוחים</p>
                <p className="font-bold font-numbers text-lg">{periods.length}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <p className="text-xs text-white/60 mb-1">הכנסה צפויה</p>
                <p className="font-bold font-numbers text-lg">{formatCurrency(totalOpen * 1.2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-dark">מחכים לתשלום</h3>
          <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
            {periods.length} לקוחות
          </span>
        </div>
        
        <div className="flex flex-col gap-4">
          {periods.length > 0 ? (
            periods.map(period => (
              <div 
                key={period.id} 
                onClick={() => { setSelectedPeriod(period); setIsDetailOpen(true); }}
                className="bg-white rounded-[2rem] p-5 shadow-glass border border-white/60 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-brand">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">לקוח: {period.ownerUserId}</h4>
                      <p className="text-xs text-gray-400">{period.entries.length} טיולים פתוחים</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black font-numbers text-brand">{formatCurrency(period.totalAmount)}</p>
                    <p className="text-[10px] text-gray-400 font-bold">לחץ לפירוט</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-dark font-black text-xl mb-1">הכל שולם!</p>
              <p className="text-gray-400 font-medium">אין חובות פתוחים כרגע.</p>
            </div>
          )}
        </div>
      </section>

      {/* Invoice Detail SlideOver */}
      <SlideOver 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title="פירוט חשבון"
      >
        {selectedPeriod && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-surface p-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand border-2 border-white shadow-sm">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-dark">לקוח: {selectedPeriod.ownerUserId}</h3>
                <p className="text-gray-500 font-medium">{selectedPeriod.entries.length} טיולים</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold">סה״כ לתשלום</span>
                <span className="text-3xl font-black font-numbers text-brand">{formatCurrency(selectedPeriod.totalAmount)}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Calendar size={16} /></div>
                    <span className="text-sm font-bold text-dark">טיולים החודש</span>
                  </div>
                  <span className="font-numbers font-bold text-dark">{selectedPeriod.entries.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSendReminder(selectedPeriod)}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <span className="text-xs font-bold text-dark">שלח תזכורת</span>
              </button>
              <button 
                onClick={() => window.location.href = `tel:0500000000`}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <span className="text-xs font-bold text-dark">התקשר לבעלים</span>
              </button>
            </div>
            
            {/* Note: Walkers cannot mark periods as paid. Only owners can close periods. */}
            <div className="mt-2 text-center text-xs text-gray-400">
              רק הלקוח יכול לסמן חשבון כשולם
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
