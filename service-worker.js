const CACHE_NAME = 'rememberthenasi-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/nasi.json',
  '/yehiRatzon.json',
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME && key.startsWith('rememberthenasi')) {
          return caches.delete(key);
        }
      }))
    )
  );
});

// Fetch: handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Handle Google Fonts (CSS + font files)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open('google-fonts-cache').then(cache =>
        cache.match(req).then(response =>
          response || fetch(req).then(fetchResponse => {
            if (fetchResponse.status === 200) {
              cache.put(req, fetchResponse.clone());
            }
            return fetchResponse;
          })
        )
      )
    );
    return;
  }

  // Default static cache fallback
  event.respondWith(
    caches.match(req).then(response =>
      response || fetch(req).catch(() => caches.match('/index.html'))
    )
  );
});