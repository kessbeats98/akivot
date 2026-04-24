'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function WalkerNav() {
  const pathname = usePathname();
  
  if (pathname === '/walker/live') return null;
  
  const navItems = [
    { path: '/walker/dashboard', icon: 'home', label: 'בית' },
    { path: '/walker/calendar', icon: 'calendar_month', label: 'יומן' },
    { path: '/walker/dogs', icon: 'pets', label: 'כלבים' },
    { path: '/walker/billing', icon: 'account_balance_wallet', label: 'כספים', badge: true },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center">
      <nav className="bg-dark/90 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center gap-2 shadow-2xl border border-white/10">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`relative ${isActive ? 'bg-white/10 text-white px-5 py-3 rounded-full flex items-center gap-2' : 'text-white/50 px-4 py-3 rounded-full'}`}>
              <span className="material-symbols-rounded text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              {isActive && <span className="text-sm font-bold">{item.label}</span>}
              {item.badge && !isActive && <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full"></span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
