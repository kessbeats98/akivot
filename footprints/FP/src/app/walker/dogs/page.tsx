'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SlideOver } from '@/components/ui/slide-over';

// Mock data
const MOCK_DOGS = [
  { id: '1', name: 'בונו', owner: 'משפחת כהן', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'לוסי', owner: 'יעל לוי', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'רקס', owner: 'משפחת אהרוני', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80' },
];

export default function WalkerDogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDogOpen, setIsAddDogOpen] = useState(false);
  const [newDog, setNewDog] = useState({ name: '', owner: '', phone: '' });

  const filteredDogs = MOCK_DOGS.filter(dog => 
    dog.name.includes(searchQuery) || dog.owner.includes(searchQuery)
  );

  const handleAddDog = (e: React.FormEvent) => {
    e.preventDefault();
    // In reality, call API
    alert(`הכלב ${newDog.name} נוסף בהצלחה!`);
    setIsAddDogOpen(false);
    setNewDog({ name: '', owner: '', phone: '' });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-end z-10">
        <div>
          <p className="text-brand/70 font-semibold text-sm mb-1">הלקוחות שלך</p>
          <h1 className="text-3xl font-black text-dark tracking-tight">הלהקה שלי</h1>
        </div>
        <button 
          onClick={() => setIsAddDogOpen(true)}
          className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-brand transition-transform active:scale-95"
        >
          <span className="material-symbols-rounded">person_add</span>
        </button>
      </header>

      <section className="px-6 mb-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="חיפוש כלב או בעלים..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 text-dark rounded-2xl py-3 px-5 pr-12 outline-none focus:border-brand shadow-sm transition-colors" 
          />
          <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        </div>
      </section>

      <section className="px-6 mb-8 flex flex-col gap-3">
        {filteredDogs.length > 0 ? (
          filteredDogs.map(dog => (
            <Link 
              key={dog.id} 
              href="/owner/dog-profile" 
              className="bg-white rounded-[2rem] p-4 shadow-glass border border-white/60 flex justify-between items-center cursor-pointer transition-transform active:scale-95"
            >
              <div className="flex items-center gap-4">
                <img src={dog.img} className="w-14 h-14 rounded-full object-cover shadow-sm" alt={dog.name} />
                <div>
                  <h4 className="font-bold text-dark text-lg mb-0.5">{dog.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-rounded text-[14px]">person</span>
                    {dog.owner}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.preventDefault(); window.location.href = 'tel:0500000000'; }}
                  className="w-10 h-10 rounded-full bg-surface text-brand flex items-center justify-center hover:bg-brand/10 transition-colors"
                >
                  <span className="material-symbols-rounded text-[20px]">call</span>
                </button>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <span className="material-symbols-rounded text-4xl mb-2 opacity-50">search_off</span>
            <p>לא נמצאו תוצאות ל&quot;{searchQuery}&quot;</p>
          </div>
        )}
      </section>

      {/* Add Dog SlideOver */}
      <SlideOver 
        isOpen={isAddDogOpen} 
        onClose={() => setIsAddDogOpen(false)} 
        title="הוספת לקוח חדש"
      >
        <form onSubmit={handleAddDog} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">שם הכלב</label>
            <input 
              required
              type="text" 
              placeholder="למשל: בונו"
              value={newDog.name}
              onChange={e => setNewDog({...newDog, name: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">שם הבעלים</label>
            <input 
              required
              type="text" 
              placeholder="למשל: משפחת כהן"
              value={newDog.owner}
              onChange={e => setNewDog({...newDog, owner: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">מספר טלפון</label>
            <input 
              required
              type="tel" 
              placeholder="050-0000000"
              value={newDog.phone}
              onChange={e => setNewDog({...newDog, phone: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand font-numbers"
            />
          </div>

          <div className="mt-4 p-4 bg-brand/5 rounded-2xl border border-brand/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <span className="material-symbols-rounded">info</span>
            </div>
            <p className="text-xs text-brand/80 leading-relaxed font-medium">
              לאחר ההוספה, הבעלים יקבלו הודעת SMS עם קישור להורדת האפליקציה וחיבור לכלב שלהם.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 mt-4"
          >
            הוסף לקוח
          </button>
        </form>
      </SlideOver>
    </div>
  );
}

