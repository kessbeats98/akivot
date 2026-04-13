/// <reference lib="webworker" />
export {};

// SW globals — must declare before imports so the type is available everywhere.
declare const self: ServiceWorkerGlobalScope;

// Service Worker — Akivot PWA
// Cache-First: static assets (_next/static, /icons)
// Network-First: everything else
// Background Sync: pending media uploads (tag "media-upload")
// FCM: background push handling merged here (owns scope /)
//
// DB name constants duplicated here intentionally — SW is a separate compiled
// bundle and cannot import from app code.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Firebase config — public values, safe to bundle
const _firebaseConfig = {
  apiKey:            "AIzaSyCJH-q9EEr8JwGZ269jAqqf1zz1iHaPmgg",
  authDomain:        "akivot.firebaseapp.com",
  projectId:         "akivot",
  storageBucket:     "akivot.firebasestorage.app",
  messagingSenderId: "415517104392",
  appId:             "1:415517104392:web:b7d2e3a7d953f81ad374bd",
};

const _fbApp = getApps().length > 0 ? getApp() : initializeApp(_firebaseConfig);

// Register our notificationclick handler BEFORE getMessaging() to ensure
// it fires before Firebase's internal handler (which calls stopImmediatePropagation
// for FCM-managed notifications).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0]!.focus();
      return self.clients.openWindow("/");
    }),
  );
});

// getMessaging() registers Firebase's push + notificationclick + pushsubscriptionchange listeners.
const _messaging = getMessaging(_fbApp);

onBackgroundMessage(_messaging, (payload) => {
  const title = payload.notification?.title ?? "Akivot";
  const body  = payload.notification?.body  ?? "";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    data: payload.data,
  });
});

// SyncEvent is not in the WebWorker lib — minimal local shim.
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

const OFFLINE_DB_NAME = "AkivotOfflineDB";
const PENDING_MEDIA_STORE = "pendingMedia";
const CACHE_NAME = "akivot-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest"];

// ---------------------------------------------------------------------------
// install
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ---------------------------------------------------------------------------
// activate
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/");

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
            return response;
          }),
      ),
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(
        () => caches.match(event.request) as Promise<Response>,
      ),
    );
  }
});

// ---------------------------------------------------------------------------
// sync — background media upload
// ---------------------------------------------------------------------------
self.addEventListener("sync" as "install", (event) => {
  const se = event as unknown as SyncEvent;
  if (se.tag === "media-upload") {
    se.waitUntil(flushPendingMedia());
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface StoredMedia {
  id: number;
  walkId: string;
  blob: Blob;
  capturedAt: string;
}

async function flushPendingMedia(): Promise<void> {
  const db = await openOfflineDb();
  const tx = db.transaction(PENDING_MEDIA_STORE, "readonly");
  const all = await idbRequest<StoredMedia[]>(
    tx.objectStore(PENDING_MEDIA_STORE).getAll(),
  );
  db.close();

  for (const item of all) {
    const form = new FormData();
    form.append("walkId", item.walkId);
    form.append("capturedAt", item.capturedAt);
    form.append("file", item.blob);

    try {
      const res = await fetch("/api/uploads/walk-media", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        await deleteFromOfflineDb(item.id);
      }
    } catch {
      // Leave in queue — will retry on next sync
    }
  }
}

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_DB_NAME, 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromOfflineDb(id: number): Promise<void> {
  const db = await openOfflineDb();
  const tx = db.transaction(PENDING_MEDIA_STORE, "readwrite");
  tx.objectStore(PENDING_MEDIA_STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
