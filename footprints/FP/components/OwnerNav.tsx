'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function OwnerNav() {
  const pathname = usePathname();
  
  if (pathname === '/owner/dog-profile' || pathname === '/owner/billing') return null;
  
  const navItems = [
    { path: '/owner/dashboard', icon: 'pets', label: 'בונו' },
    { path: '/owner/calendar', icon: 'calendar_month', label: 'יומן' },
    { path: '/owner/billing', icon: 'account_balance_wallet', label: 'תשלום' },
    { path: '/owner/settings', icon: 'settings', label: 'הגדרות' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center">
      <nav className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center gap-2 shadow-glass border border-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={isActive ? 'bg-brand text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-glow-brand' : 'text-gray-400 px-4 py-3 rounded-full'}>
              <span className="material-symbols-rounded text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              {isActive && <span className="text-sm font-bold">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
