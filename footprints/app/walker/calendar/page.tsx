'use client';
import Link from 'next/link';
import { useState } from 'react';
import { format, addDays, subDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { he } from 'date-fns/locale';

export default function WalkerCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const daysInWeek = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  // Mock data filtering based on selected date
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-end z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">תכנון שבועי</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">היומן שלי</h1>
        </div>
        <button className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-brand transition-transform active:scale-95">
          <span className="material-symbols-rounded">add</span>
        </button>
      </header>

      <section className="px-6 mb-6 mt-2">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-glass border border-white/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-dark capitalize">
              {format(currentWeekStart, 'MMMM yyyy', { locale: he })}
            </h2>
            <div className="flex gap-2 text-gray-400">
              <button onClick={handleNextWeek} className="material-symbols-rounded cursor-pointer hover:text-brand transition-colors">chevron_right</button>
              <button onClick={handlePrevWeek} className="material-symbols-rounded cursor-pointer hover:text-brand transition-colors">chevron_left</button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-center">
            {daysInWeek.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayName = format(day, 'EEEEEE', { locale: he }); // א', ב' etc.
              const dayNumber = format(day, 'd');
              
              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center gap-1 relative transition-all ${isSelected ? '' : 'opacity-50 hover:opacity-100'}`}
                >
                  <span className={`text-xs ${isSelected ? 'font-bold text-dark' : 'text-gray-400'}`}>
                    {dayName}
                  </span>
                  {isSelected ? (
                    <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-glow-brand font-numbers font-bold">
                      {dayNumber}
                    </div>
                  ) : (
                    <span className="text-sm font-numbers font-bold w-10 h-10 flex items-center justify-center">
                      {dayNumber}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-dark">
            {isToday ? 'הלו"ז להיום' : `הלו"ז ל-${format(selectedDate, 'dd/MM')}`}
          </h3>
          <span className="text-xs bg-brand-light text-brand px-2 py-1 rounded-md font-bold">
            {isToday ? '5 טיולים' : 'אין טיולים'}
          </span>
        </div>
        
        {isToday ? (
          <div className="flex flex-col gap-4 border-r-2 border-gray-100 pr-4 relative">
            <div className="relative">
              <div className="absolute -right-[23px] top-2 w-3 h-3 rounded-full bg-brand shadow-[0_0_0_4px_#F7F9F9]"></div>
              <div className="bg-white rounded-2xl p-4 shadow-glass border border-white/60">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-dark">טיול בוקר - קבוצה א&apos;</h4>
                    <p className="text-xs text-brand font-numbers font-bold mt-1">08:00 - 09:00</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">הושלם</span>
                </div>
                <div className="flex -space-x-2 space-x-reverse mt-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" alt="Dog" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80" alt="Dog" />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -right-[23px] top-2 w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_0_4px_#F7F9F9]"></div>
              <Link href="/walker/live" className="block bg-brand rounded-2xl p-4 shadow-glow-brand border border-white/20 text-white cursor-pointer transition-transform active:scale-95">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">טיול צהריים - קבוצה ב&apos;</h4>
                    <p className="text-xs text-white/70 font-numbers font-bold mt-1">14:00 - 15:00</p>
                  </div>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">הבא</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex -space-x-2 space-x-reverse">
                    <img className="w-8 h-8 rounded-full border-2 border-brand object-cover" src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80" alt="Dog" />
                    <img className="w-8 h-8 rounded-full border-2 border-brand object-cover" src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80" alt="Dog" />
                    <img className="w-8 h-8 rounded-full border-2 border-brand object-cover" src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=150&q=80" alt="Dog" />
                  </div>
                  <button className="text-xs bg-white text-brand px-3 py-1.5 rounded-lg font-bold">התחל טיול</button>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/50 rounded-2xl p-8 text-center border border-white/60 border-dashed">
            <span className="material-symbols-rounded text-4xl text-gray-300 mb-2">event_busy</span>
            <p className="text-gray-500 font-medium">אין טיולים מתוכננים ליום זה</p>
            <button className="mt-4 text-sm font-bold text-brand bg-white px-4 py-2 rounded-full shadow-sm border border-brand/10">
              + הוסף טיול
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
