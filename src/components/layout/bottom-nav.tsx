"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, PawPrint, CreditCard } from "lucide-react";

const tabs = [
  { label: "דשבורד", icon: LayoutDashboard, href: "/walker/dashboard" },
  { label: "יומן", icon: Calendar, href: "/walker/calendar" },
  { label: "כלבים", icon: PawPrint, href: "/walker/dogs" },
  { label: "תשלומים", icon: CreditCard, href: "/walker/billing" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t flex items-center justify-around z-50">
      {tabs.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        return (
          <a
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 text-xs min-w-[44px] ${
              active ? "text-[#2A9D8F]" : "text-[#9CA3AF]"
            }`}
          >
            <Icon size={22} />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
