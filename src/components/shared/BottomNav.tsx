"use client";

import Link from "next/link";
import { Home, Calendar, Dog, Wallet, Settings } from "lucide-react";

type NavTab = "home" | "calendar" | "dogs" | "finance" | "payments" | "settings";

type BottomNavProps = {
  variant: "walker" | "owner";
  active: NavTab;
};

const walkerTabs: { key: NavTab; label: string; icon: typeof Home; href: string }[] = [
  { key: "home", label: "בית", icon: Home, href: "/walker" },
  { key: "calendar", label: "יומן", icon: Calendar, href: "/walker/calendar" },
  { key: "dogs", label: "כלבים", icon: Dog, href: "/walker/dogs" },
  { key: "finance", label: "כספים", icon: Wallet, href: "/walker/billing" },
];

const ownerTabs: { key: NavTab; label: string; icon: typeof Home; href: string }[] = [
  { key: "home", label: "בית", icon: Home, href: "/owner" },
  { key: "calendar", label: "יומן", icon: Calendar, href: "/owner/calendar" },
  { key: "payments", label: "תשלומים", icon: Wallet, href: "/owner/billing" },
  { key: "settings", label: "הגדרות", icon: Settings, href: "/owner/settings" },
];

export function BottomNav({ variant, active }: BottomNavProps) {
  const tabs = variant === "walker" ? walkerTabs : ownerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-card border-t border-border rounded-t-[24px] safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`
                flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors
                ${isActive 
                  ? "bg-primary-light text-primary" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
