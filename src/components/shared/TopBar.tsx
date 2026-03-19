"use client";

import { Bell, MessageCircle, User } from "lucide-react";

type TopBarProps = {
  name: string;
  notificationsCount?: number;
  messagesCount?: number;
};

export function TopBar({ name, notificationsCount = 0, messagesCount = 0 }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      {/* Right side - Avatar and greeting (RTL) */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <span className="text-foreground font-medium">שלום {name}!</span>
      </div>

      {/* Left side - Notification icons (RTL) */}
      <div className="flex items-center gap-2">
        <button 
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={`${messagesCount} הודעות חדשות`}
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          {messagesCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
              {messagesCount > 99 ? "99+" : messagesCount}
            </span>
          )}
        </button>
        <button 
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={`${notificationsCount} התראות חדשות`}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {notificationsCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-destructive text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
              {notificationsCount > 99 ? "99+" : notificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
