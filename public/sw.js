"use strict";
(() => {
  // src/workers/service-worker.ts
  var OFFLINE_DB_NAME = "AkivotOfflineDB";
  var PENDING_MEDIA_STORE = "pendingMedia";
  var CACHE_NAME = "akivot-v1";
  var PRECACHE_URLS = ["/", "/manifest.webmanifest"];
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
    );
  });
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then(
        (keys) => Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ).then(() => self.clients.claim())
    );
  });
  self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    const isStatic = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
    if (isStatic) {
      event.respondWith(
        caches.match(event.request).then(
          (cached) => cached != null ? cached : fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
        )
      );
    } else {
      event.respondWith(
        fetch(event.request).catch(
          () => caches.match(event.request)
        )
      );
    }
  });
  self.addEventListener("sync", (event) => {
    const se = event;
    if (se.tag === "media-upload") {
      se.waitUntil(flushPendingMedia());
    }
  });
  async function flushPendingMedia() {
    const db = await openOfflineDb();
    const tx = db.transaction(PENDING_MEDIA_STORE, "readonly");
    const all = await idbRequest(
      tx.objectStore(PENDING_MEDIA_STORE).getAll()
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
          body: form
        });
        if (res.ok) {
          await deleteFromOfflineDb(item.id);
        }
      } catch (e) {
      }
    }
  }
  function openOfflineDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(OFFLINE_DB_NAME, 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function deleteFromOfflineDb(id) {
    const db = await openOfflineDb();
    const tx = db.transaction(PENDING_MEDIA_STORE, "readwrite");
    tx.objectStore(PENDING_MEDIA_STORE).delete(id);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
  function idbRequest(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
})();
