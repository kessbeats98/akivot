"use client";

import { Bell, BellOff } from "lucide-react";
import { useFcmToken } from "@/lib/hooks/useFcmToken";

export function EnableNotificationsButton() {
  const { supported, permissionState, requestPermission } = useFcmToken();

  if (!supported || permissionState === "loading") return null;

  if (permissionState === "granted") {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2A9D8F]/10">
        <Bell size={20} className="text-[#2A9D8F]" />
      </div>
    );
  }

  if (permissionState === "denied") {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100">
        <BellOff size={20} className="text-neutral-400" />
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2A9D8F]/10 hover:bg-[#2A9D8F]/20 transition-colors"
      type="button"
      aria-label="הפעל התראות"
    >
      <Bell size={20} className="text-[#2A9D8F]" />
    </button>
  );
}
