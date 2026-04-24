'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SlideOver } from '@/components/ui/slide-over';
import { 
  ArrowRight, 
  Edit2, 
  AlertCircle, 
  Bone, 
  Phone, 
  Heart, 
  Calendar, 
  Image as ImageIcon,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function DogProfile() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [dogData, setDogData] = useState({
    name: 'בונו',
    breed: 'גולדן רטריבר',
    age: '3',
    notes: 'אלרגי לעוף ולחיטה. מושך מאוד חזק ליד פחים.',
    vet: 'מרפאת חיות העיר - ד״ר כהן'
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditOpen(false);
    alert('הפרופיל עודכן בהצלחה!');
  };

  return (
    <div className="animate-in fade-in duration-300 h-screen -mt-10 overflow-y-auto pb-20 relative">
      <div className="fixed top-0 left-0 w-full h-80 z-0">
        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80" alt="Bono" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-surface"></div>
      </div>

      <header className="px-6 pt-12 pb-4 flex justify-between items-center relative z-10">
        <Link href="/owner" className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-white transition-transform active:scale-95">
          <ArrowRight size={24} />
        </Link>
        <button 
          onClick={() => setIsEditOpen(true)}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-white transition-transform active:scale-95"
        >
          <Edit2 size={20} />
        </button>
      </header>

      <main className="flex-1 bg-surface w-full rounded-t-[3rem] mt-32 px-6 pt-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 min-h-[60vh]">
        <div className="mb-8 mt-2">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-dark tracking-tight mb-1">{dogData.name}</h1>
              <p className="text-gray-500 font-medium text-lg">{dogData.breed} • בן {dogData.age}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Heart size={24} fill="currentColor" />
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-dark mb-4 px-2">דגשים חשובים</h3>
        <div className="flex flex-col gap-3 mb-8">
          <div className="bg-red-50/80 rounded-[2rem] p-5 border border-red-100 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 w-2 h-full bg-danger"></div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-danger shrink-0 shadow-sm">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-danger text-sm mb-1">רגישות למזון</h4>
              <p className="text-sm text-gray-700 font-medium">אלרגי לעוף ולחיטה.</p>
            </div>
          </div>
          <div className="bg-orange-50/80 rounded-[2rem] p-5 border border-orange-100 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 w-2 h-full bg-accent"></div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-accent shrink-0 shadow-sm">
              <Bone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-accent text-sm mb-1">התנהגות בטיול</h4>
              <p className="text-sm text-gray-700 font-medium">מושך מאוד חזק ליד פחים.</p>
            </div>
          </div>
        </div>

        <div className="bg-dark rounded-[2rem] p-6 flex items-center justify-between shadow-glow-brand mb-10">
          <div>
            <h4 className="font-bold text-white mb-1">וטרינר חירום</h4>
            <p className="text-sm text-gray-400 font-medium">{dogData.vet}</p>
          </div>
          <a href="tel:0501234567" className="w-12 h-12 bg-white text-dark rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95">
            <Phone size={24} />
          </a>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold text-dark flex items-center gap-2">
              <ImageIcon size={18} className="text-brand" />
              גלריית טיולים
            </h3>
            <button className="text-brand text-xs font-bold">הכל</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <img 
                key={i} 
                src={`https://picsum.photos/seed/dog${i}/300/300`} 
                className="aspect-square rounded-2xl object-cover border border-white shadow-sm transition-transform active:scale-95" 
                alt="Walk" 
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold text-dark flex items-center gap-2">
              <Calendar size={18} className="text-brand" />
              היסטוריית טיולים
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { date: 'היום, 14:20', duration: '45 דק׳', status: 'הושלם' },
              { date: 'אתמול, 10:15', duration: '40 דק׳', status: 'הושלם' },
              { date: '12.03, 16:30', duration: '50 דק׳', status: 'הושלם' },
            ].map((walk, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">{walk.date}</p>
                    <p className="text-xs text-gray-400 font-medium">{walk.duration}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-lg font-bold">הושלם</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Dog SlideOver */}
      <SlideOver 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="עריכת פרופיל"
      >
        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">שם הכלב</label>
            <input 
              required
              type="text" 
              value={dogData.name}
              onChange={e => setDogData({...dogData, name: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">גזע</label>
            <input 
              required
              type="text" 
              value={dogData.breed}
              onChange={e => setDogData({...dogData, breed: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">גיל</label>
            <input 
              required
              type="text" 
              value={dogData.age}
              onChange={e => setDogData({...dogData, age: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-dark px-1">דגשים והערות</label>
            <textarea 
              value={dogData.notes}
              onChange={e => setDogData({...dogData, notes: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-brand min-h-[100px] resize-none"
            />
          </div>

          <div className="p-4 bg-surface rounded-2xl flex items-center gap-3">
            <Info size={20} className="text-brand" />
            <p className="text-xs text-gray-500 font-medium">שינויים אלו יופיעו אצל הדוגווקר שלך באופן מיידי.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xl shadow-glow-brand transition-transform active:scale-95 mt-4"
          >
            שמור שינויים
          </button>
        </form>
      </SlideOver>
    </div>
  );
}

