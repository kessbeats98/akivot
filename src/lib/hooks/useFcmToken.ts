"use client";

import { useState, useEffect } from "react";

type UseFcmTokenResult = {
  supported: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
};

export function useFcmToken(): UseFcmTokenResult {
  const [supported, setSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Check support and existing permission on mount
    const checkSupport = async () => {
      if (typeof window === "undefined") return;
      try {
        const { isSupported } = await import("firebase/messaging");
        const ok = await isSupported();
        setSupported(ok);
        if (ok && Notification.permission === "granted") {
          setPermissionGranted(true);
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

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

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
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "Akivot";
        const body = payload.notification?.body ?? "";
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        }
      });

      setPermissionGranted(true);
    } catch (err) {
      console.error("[useFcmToken] requestPermission error:", err);
    }
  };

  return { supported, permissionGranted, requestPermission };
}
