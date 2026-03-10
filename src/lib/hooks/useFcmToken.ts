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
    // Check support and existing permission on mount
    const checkSupport = async () => {
      if (typeof window === "undefined") return;
      try {
        const { isSupported } = await import("firebase/messaging");
        const ok = await isSupported();
        setSupported(ok);
        if (ok) {
          setPermissionState(Notification.permission);
        }
      } catch {
        setSupported(false);
      }
    };
    checkSupport();
  }, []);

  const requestPermission = async () => {
    try {
      const { isSupported, getMessaging, getToken, onMessage } = await import("firebase/messaging");
      const { initializeApp, getApps, getApp } = await import("firebase/app");

      const ok = await isSupported();
      if (!ok) return;

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

      // Pass config to SW via URL params
      const params = new URLSearchParams(firebaseConfig as any).toString();
      const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`);

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) return;

      await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token, platform: "WEB_DESKTOP" }),
      });

      // Foreground message handler
      onMessage(messaging, async (payload) => {
        const title = payload.notification?.title ?? "Akivot";
        const body = payload.notification?.body ?? "";
        if (Notification.permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, { body });
        }
      });

      setPermissionState(Notification.permission);
    } catch (err) {
      console.error("[useFcmToken] requestPermission error:", err);
    }
  };

  return { supported, permissionState, requestPermission };
}
