"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { path: "/owner/dashboard", icon: "pets", label: "הכלבים" },
  { path: "/owner/calendar", icon: "calendar_month", label: "יומן" },
  { path: "/owner/billing", icon: "account_balance_wallet", label: "תשלום" },
  { path: "/owner/settings", icon: "settings", label: "הגדרות" },
];

/** Hide on dog-profile (full-screen overlay) */
const HIDDEN_PATHS = ["/owner/dog-profile"];

export function OwnerNav() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center">
      <nav className="bg-white/90 backdrop-blur-xl rounded-organic p-2 flex items-center gap-2 shadow-glass border border-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={
                isActive
                  ? "bg-brand text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-glow-brand transition-all"
                  : "text-gray-400 px-4 py-3 rounded-full transition-colors hover:text-gray-600"
              }
            >
              <span
                className="material-symbols-rounded text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
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
