// Unified Service Worker: Offline Support + OneSignal Push

const CACHE_NAME = 'rememberthenasi-v14';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.html?v=20260320a',
  '/styles.css',
  '/styles.css?v=20260320a',
  '/manifest.json',
  '/manifest.json?v=20260320a',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/nasi.json',
  '/yehiRatzon.json',
];

// Cache core files on install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Remove old caches
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// Serve cached content on failure
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 🟢 Add OneSignal Push Notifications Support
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");