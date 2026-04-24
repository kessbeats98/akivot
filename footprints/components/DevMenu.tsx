'use client';

import { useRouter, usePathname } from 'next/navigation';

export function DevMenu() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 bg-dark/90 backdrop-blur-md text-white px-4 py-2 flex justify-between items-center text-xs border-b border-white/20 z-[9999]">
      <span className="font-bold tracking-wider">🐾 מנהל תצוגות:</span>
      <select 
        value={pathname}
        onChange={(e) => router.push(e.target.value)} 
        className="bg-dark border border-white/20 rounded px-2 py-1 outline-none font-sans text-white"
      >
        <optgroup label="התחברות">
          <option value="/">מסך כניסה והזמנה</option>
        </optgroup>
        <optgroup label="דוגווקר (Walker)">
          <option value="/walker">דשבורד ראשי</option>
          <option value="/walker/calendar">יומן דוגווקר (חדש)</option>
          <option value="/walker/dogs">הכלבים שלי (חדש)</option>
          <option value="/walker/live">מצב טיול (Live)</option>
          <option value="/walker/finance">כספים ולקוחות</option>
        </optgroup>
        <optgroup label="בעלים (Owner)">
          <option value="/owner">דשבורד בעלים</option>
          <option value="/owner/calendar">יומן היסטוריה (בעלים)</option>
          <option value="/owner/payment">בקשת תשלום (חשבונית)</option>
          <option value="/owner/dog-profile">פרופיל הכלב</option>
          <option value="/owner/settings">הגדרות</option>
        </optgroup>
      </select>
    </div>
  );
}
