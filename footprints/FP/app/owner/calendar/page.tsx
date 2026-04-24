export default function OwnerCalendar() {
  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-end z-10">
        <div><p className="text-brand/70 font-semibold text-sm mb-1">היסטוריה וזכרונות</p><h1 className="text-3xl font-black text-dark tracking-tight">היומן של בונו</h1></div>
      </header>

      <section className="px-6 mb-8 mt-2">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-glass border border-white/60">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-dark">מרץ 2026</h2></div>
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-4 tracking-widest">
            <span>א&apos;</span><span>ב&apos;</span><span>ג&apos;</span><span>ד&apos;</span><span>ה&apos;</span><span>ו&apos;</span><span>ש&apos;</span>
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-1">
            <div className="h-10"></div><div className="h-10"></div>
            <div className="flex flex-col items-center justify-center relative"><span className="text-sm font-numbers font-semibold text-gray-300">1</span><span className="material-symbols-rounded text-[10px] text-brand mt-1 opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span></div>
            <div className="flex flex-col items-center justify-center relative"><span className="text-sm font-numbers font-semibold text-gray-300">2</span><span className="material-symbols-rounded text-[10px] text-brand mt-1 opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span></div>
            <div className="flex flex-col items-center justify-center relative"><div className="w-10 h-10 bg-brand text-white rounded-2xl flex items-center justify-center shadow-glow-brand font-numbers font-bold text-sm">3</div><span className="w-1 h-1 bg-brand rounded-full mt-1"></span></div>
            <div className="flex flex-col items-center justify-center"><span className="text-sm font-numbers font-semibold text-gray-400">4</span></div>
          </div>
        </div>
      </section>

      <section className="px-6 flex flex-col gap-5">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-glass border border-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span></div><div><h3 className="font-bold text-dark text-sm">טיול צהריים עם דני</h3><p className="text-xs text-gray-500 font-numbers mt-0.5">היום, 14:00 - 14:45</p></div></div>
          </div>
          <div className="bg-surface rounded-2xl p-4 mb-4 border border-gray-100 relative"><p className="text-sm text-gray-600 font-medium">&quot;בונו היה מקסים היום! הכל תקין.&quot;</p></div>
          <img src="https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=600&q=80" className="w-full h-40 rounded-2xl object-cover shadow-sm" alt="Walk" />
        </div>
      </section>
    </div>
  );
}
