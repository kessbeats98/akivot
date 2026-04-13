"use client";

import { useState, useEffect } from "react";

type UseFcmTokenResult = {
  supported: boolean;
  permissionState: NotificationPermission | "loading";
  requestPermission: () => Promise<void>;
};

export function useFcmToken(): UseFcmTokenResult {
  const [supported, setSupported] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "loading">("loading");

  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === "undefined") return;
      try {
        const { isSupported } = await import("firebase/messaging");
        const ok = await isSupported();
        setSupported(ok);
        if (ok) {
          setPermissionState(Notification.permission);
          console.log("[fcm] support check passed, permission:", Notification.permission);
        } else {
          console.log("[fcm] FCM not supported in this browser");
        }
      } catch (err) {
        console.error("[fcm] support check failed:", err);
        setSupported(false);
      }
    };
    checkSupport();
  }, []);

  const requestPermission = async () => {
    console.log("[fcm] requestPermission called");
    try {
      const { isSupported, getMessaging, getToken, onMessage } = await import("firebase/messaging");
      const { initializeApp, getApps, getApp } = await import("firebase/app");

      const ok = await isSupported();
      if (!ok) {
        console.warn("[fcm] FCM not supported, aborting");
        return;
      }

      // Public config — safe to hardcode (same values as NEXT_PUBLIC_FIREBASE_* env vars).
      const firebaseConfig = {
        apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? "AIzaSyCJH-q9EEr8JwGZ269jAqqf1zz1iHaPmgg",
        authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "akivot.firebaseapp.com",
        projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? "akivot",
        storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "akivot.firebasestorage.app",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "415517104392",
        appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? "1:415517104392:web:b7d2e3a7d953f81ad374bd",
      };

      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Reuse an existing SW registration if one is already active for this script.
      // Re-registering the same SW causes FCM to issue a new token, which immediately
      // invalidates the previous one — producing stale device rows and TOKEN_INVALID failures.
      const swUrl = `/firebase-messaging-sw.js`;
      const existing = await navigator.serviceWorker.getRegistration(swUrl);
      const params = new URLSearchParams(firebaseConfig as Record<string, string>).toString();
      const registration = existing ?? await navigator.serviceWorker.register(`${swUrl}?${params}`);
      console.log("[fcm] service worker registered");

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        console.warn("[fcm] no token received from getToken");
        return;
      }
      console.log("[fcm] token obtained, registering with backend...");

      // Register token with our backend
      try {
        const res = await fetch("/api/devices/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token, platform: "WEB_DESKTOP" }),
        });
        if (!res.ok) {
          console.error("[fcm] token registration HTTP error:", res.status, await res.text().catch(() => ""));
        } else {
          console.log("[fcm] token registered successfully");
        }
      } catch (fetchErr) {
        console.error("[fcm] token registration network error:", fetchErr);
      }

      // Foreground message handler
      onMessage(messaging, async (payload) => {
        console.log("[fcm] foreground message received:", payload.notification?.title);
        const title = payload.notification?.title ?? "Akivot";
        const body = payload.notification?.body ?? "";
        if (Notification.permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, { body });
        }
      });

      setPermissionState(Notification.permission);
      console.log("[fcm] permission state after flow:", Notification.permission);
    } catch (err) {
      console.error("[fcm] requestPermission error:", err);
    }
  };

  return { supported, permissionState, requestPermission };
}
