"use client";

import { Bell, BellOff } from "lucide-react";
import { useFcmToken } from "@/lib/hooks/useFcmToken";

export function EnableNotificationsButton() {
  const { supported, permissionState, requestPermission } = useFcmToken();

  if (!supported || permissionState === "loading") return null;

  if (permissionState === "granted") {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-light">
        <Bell size={20} className="text-brand" />
      </div>
    );
  }

  if (permissionState === "denied") {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone100" title="התראות חסומות — שנה בהגדרות הדפדפן">
        <BellOff size={20} className="text-muted-color" />
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-light hover:bg-brand-light/80 transition-colors"
      type="button"
      aria-label="הפעל התראות"
    >
      <Bell size={20} className="text-brand" />
    </button>
  );
}
