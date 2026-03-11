"use client";

import { useFcmToken } from "@/lib/hooks/useFcmToken";

export function EnableNotificationsButton() {
  const { supported, permissionState, requestPermission } = useFcmToken();

  if (!supported || permissionState === "granted" || permissionState === "loading") return null;

  if (permissionState === "denied") {
    return (
      <div className="text-xs text-neutral-500 italic px-4 py-2 border border-transparent">
        Notifications blocked in browser
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
      type="button"
    >
      Enable Notifications
    </button>
  );
}
