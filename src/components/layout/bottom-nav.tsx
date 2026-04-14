"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { path: "/walker/dashboard", icon: "home", label: "בית", primary: true },
  { path: "/walker/dogs", icon: "pets", label: "לקוחות" },
  { path: "/walker/billing", icon: "account_balance_wallet", label: "כספים", badge: true },
];

/** Hide during live walk (full-screen experience) */
const HIDDEN_PATHS = ["/walker/live"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center">
      <nav className="bg-dark/90 backdrop-blur-xl rounded-organic p-2 flex items-center gap-2 shadow-2xl border border-white/10">
        {navItems.map((item) => {
          const isActive =
            item.path === "/walker/dashboard"
              ? pathname === "/walker/dashboard"
              : pathname.startsWith(item.path);

          if (item.primary) {
            // Home: always shows label; active = white pill, inactive = muted icon+label
            return (
              <Link
                key={item.path}
                href={item.path}
                className={
                  isActive
                    ? "bg-white/15 text-white px-5 py-3 rounded-full flex items-center gap-2 transition-all"
                    : "text-white/50 px-4 py-3 rounded-full flex items-center gap-1.5 transition-colors hover:text-white/70"
                }
              >
                <span
                  className="material-symbols-rounded text-2xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className={isActive ? "text-sm font-bold" : "text-xs font-medium"}>
                  {item.label}
                </span>
              </Link>
            );
          }

          // Secondary: active = soft tinted pill, icon only; inactive = gray icon only
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative ${
                isActive
                  ? "bg-white/10 text-white px-4 py-3 rounded-full flex items-center transition-all"
                  : "text-white/40 px-4 py-3 rounded-full transition-colors hover:text-white/60"
              }`}
            >
              <span
                className="material-symbols-rounded text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.badge && !isActive && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
