'use client';

import { useState, useEffect } from 'react';
import { OwnerNav } from '@/components/OwnerNav';
import { getOwnerBillingAction, closePeriodAction } from './actions';
import { PaymentPeriodWithEntries } from '@/lib/services/billing/types';

export default function OwnerBillingPage() {
  const [periods, setPeriods] = useState<PaymentPeriodWithEntries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBilling() {
      try {
        const data = await getOwnerBillingAction();
        setPeriods(data.periods);
      } catch (error) {
        console.error('Failed to load billing', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBilling();
  }, []);

  const handlePay = async (periodId: string, lockVersion: number) => {
    try {
      await closePeriodAction(periodId, lockVersion);
      alert('התשלום בוצע בהצלחה');
      // Reload
      const data = await getOwnerBillingAction();
      setPeriods(data.periods);
    } catch (error) {
      alert('שגיאה בביצוע התשלום. ייתכן שהנתונים השתנו, אנא רענן.');
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-default min-h-screen">
      <header className="bg-white px-6 py-6 rounded-b-3xl shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-dark">תשלומים</h1>
        <p className="text-gray-500 text-sm mt-1">פירוט חיובים ותשלומים</p>
      </header>

      <section className="p-6 flex-1">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">טוען נתונים...</div>
        ) : periods.length === 0 ? (
          <div className="text-center py-10 text-gray-500">אין חיובים פתוחים</div>
        ) : (
          <div className="flex flex-col gap-4">
            {periods.map(period => (
              <div key={period.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">תקופת חיוב</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${period.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-accent/10 text-accent'}`}>
                    {period.status === 'PAID' ? 'שולם' : 'פתוח'}
                  </span>
                </div>
                <div className="text-3xl font-numbers font-bold text-dark mb-4">
                  ₪{period.totalAmount}
                </div>
                {period.status !== 'PAID' && (
                  <button 
                    onClick={() => handlePay(period.id, period.lockVersion)}
                    className="w-full bg-dark text-white py-3 rounded-xl font-bold hover:bg-dark/90 transition-colors"
                  >
                    שלם עכשיו ב-Bit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <OwnerNav />
    </main>
  );
}
