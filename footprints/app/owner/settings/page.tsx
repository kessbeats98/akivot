import Link from 'next/link';

export default function OwnerSettings() {
  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-6 flex justify-between items-center z-10">
        <h1 className="text-3xl font-black text-dark tracking-tight">הגדרות</h1>
        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-dark"><span className="material-symbols-rounded">settings</span></div>
      </header>

      <section className="px-6 mb-6">
        <div className="bg-gradient-to-br from-dark to-gray-800 rounded-[2rem] p-6 shadow-glow-brand border border-gray-700">
          <h3 className="font-bold text-white mb-1">התקן את עקבות</h3>
          <p className="text-xs text-gray-400 font-medium mb-3 leading-relaxed">לחוויה מושלמת וקבלת התראות באייפון, בחר <strong>&quot;הוסף למסך הבית&quot;</strong>.</p>
        </div>
      </section>

      <section className="px-6 mb-6">
        <h3 className="text-lg font-bold text-dark mb-4">התראות ועדכונים</h3>
        <div className="bg-white rounded-[2rem] p-2 shadow-glass border border-white/60">
          <div className="flex items-center justify-between p-4 border-b border-gray-50">
            <div><h4 className="font-bold text-sm text-dark">טיולים בשידור חי</h4></div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-brand appearance-none cursor-pointer z-10" style={{ right: '1.5rem' }}/>
              <label className="toggle-label block overflow-hidden h-6 rounded-full bg-brand cursor-pointer"></label>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <h3 className="text-lg font-bold text-dark mb-4">חשבון</h3>
        <div className="bg-white rounded-[2rem] p-2 shadow-glass border border-white/60">
          <Link href="/" className="flex items-center gap-3 p-4 text-danger font-bold text-sm w-full">
            <span className="material-symbols-rounded text-danger/70">logout</span> התנתקות מהחשבון
          </Link>
        </div>
      </section>
    </div>
  );
}
