// Unified Service Worker: Offline Support + OneSignal Push

const CACHE_NAME = 'rememberthenasi-v15';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.html?v=20260322a',
  '/styles.css',
  '/styles.css?v=20260322a',
  '/manifest.json',
  '/manifest.json?v=20260322a',
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

// Handle skipWaiting message from the page
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Serve cached content on failure (same-origin GET requests only)
self.addEventListener('fetch', event => {
  const { request } = event;
  // Only intercept same-origin GET requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    fetch(request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// 🟢 Add OneSignal Push Notifications Support
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");