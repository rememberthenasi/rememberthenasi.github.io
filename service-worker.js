const CACHE_NAME = 'rememberthenasi-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/nasi.json',
  '/yehiRatzon.json',
];

self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  clients.claim(); // control pages immediately
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  
    if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchAndUpdate = fetch(req).then(res => {
          if (res.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          }
          return res;
        });
  
        // Serve cached fast, update silently
        return cached || fetchAndUpdate;
      })
    );
  });
  
  // ✅ Fix: handle skipWaiting messages correctly
  self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });  