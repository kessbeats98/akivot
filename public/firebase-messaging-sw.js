// Firebase Cloud Messaging background message handler.
// Must be served from root scope (/firebase-messaging-sw.js).
// Uses compat SDK via importScripts — ESM not supported in service workers.

importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js');

// Parse Firebase config from URL query params injected during SW registration.
// Falls back to hardcoded values (public config — safe to commit).
const urlParams = new URLSearchParams(location.search);

firebase.initializeApp({
  apiKey:            urlParams.get('apiKey')            || 'AIzaSyCJH-q9EEr8JwGZ269jAqqf1zz1iHaPmgg',
  authDomain:        urlParams.get('authDomain')        || 'akivot.firebaseapp.com',
  projectId:         urlParams.get('projectId')         || 'akivot',
  storageBucket:     urlParams.get('storageBucket')     || 'akivot.firebasestorage.app',
  messagingSenderId: urlParams.get('messagingSenderId') || '415517104392',
  appId:             urlParams.get('appId')             || '1:415517104392:web:b7d2e3a7d953f81ad374bd',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Akivot';
  const body = payload.notification?.body ?? '';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    }),
  );
});
