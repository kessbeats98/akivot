"use client";

import { useEffect } from "react";
import { getPendingMedia, dequeueMedia } from "@/lib/offline/mediaQueue";

async function retryPendingUploads(): Promise<void> {
  const pending = await getPendingMedia();
  for (const item of pending) {
    if (item.id === undefined) continue;
    const form = new FormData();
    form.append("walkId", item.walkId);
    form.append("capturedAt", item.capturedAt.toISOString());
    form.append("file", item.blob);
    try {
      const res = await fetch("/api/uploads/walk-media", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        await dequeueMedia(item.id);
      }
    } catch {
      // Leave in queue — will retry next time
    }
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[SW] Registration failed", err);
    });

    window.addEventListener("online", retryPendingUploads);
    return () => {
      window.removeEventListener("online", retryPendingUploads);
    };
  }, []);

  return null;
}
