// Unified Service Worker: Offline Support + OneSignal Push
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'rememberthenasi-v16';

// Allowlisted assets to precache (versioned URLs matching index.html references; no duplicates)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css?v=20260322a',
  '/manifest.json?v=20260322a',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/nasi.json',
  '/yehiRatzon.json',
];

// Paths eligible for cache-first / stale-while-revalidate (must be same-origin)
const STATIC_ASSET_PATHS = new Set([
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]);

// JSON data files that should be available offline but also refreshed in background
const DATA_ASSET_PATHS = new Set([
  '/nasi.json',
  '/yehiRatzon.json',
]);

// Precache allowlisted assets on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Remove old caches and take control of all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => clients.claim())
  );
});

// Handle skipWaiting message from the page
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle same-origin requests (let cross-origin pass through, including OneSignal)
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const pathname = url.pathname;

  // --- Navigation requests: network-first, fallback to cached /index.html ---
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update the cached index.html while serving the fresh copy
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(cached => cached || caches.match('/'))
        )
    );
    return;
  }

  // --- JSON data files: stale-while-revalidate (serve cache immediately, refresh in background) ---
  if (DATA_ASSET_PATHS.has(pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request)
            .then(response => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached); // on network failure, fall back to cached copy
          // Serve cached copy immediately if available; background-refresh from network
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // --- Known static assets (CSS, icons, manifest): stale-while-revalidate from allowlist ---
  if (STATIC_ASSET_PATHS.has(pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request)
            .then(response => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached); // on network failure, fall back to cached copy
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // --- Everything else: pass through without caching ---
});