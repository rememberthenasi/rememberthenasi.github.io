const CACHE_NAME = 'rememberthenasi-v10';
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

console.log('Using cache version:', CACHE_NAME);

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  clients.claim(); // Control pages immediately
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Clone the response before putting it into the cache
      const responseClone = response.clone();
      
      caches.open('rememberthenasi-v10').then(cache => {
        cache.put(event.request, responseClone);
      });

      return response;
    }).catch(error => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});