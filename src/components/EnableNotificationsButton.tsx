"use client";

import { useFcmToken } from "@/lib/hooks/useFcmToken";

export function EnableNotificationsButton() {
  const { supported, permissionGranted, requestPermission } = useFcmToken();

  if (!supported || permissionGranted) return null;

  return (
    <button
      onClick={requestPermission}
      className="border rounded px-4 py-2 text-sm hover:bg-accent"
      type="button"
    >
      Enable Notifications
    </button>
  );
}
