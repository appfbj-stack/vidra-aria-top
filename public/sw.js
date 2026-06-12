const CACHE_NAME = 'vidracaria-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(ASSETS);
    }).catch(err => console.error('[Service Worker] Pre-cache failed:', err))
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event with Cache-First / Network fallback
self.addEventListener('fetch', (e) => {
  // Allow chrome-extension or other non-http resources to pass through
  if (!e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache in parallel with updating cache (stale-while-revalidate pattern for non-index files)
        if (e.request.url.includes('/manifest.json') || e.request.url.includes('/icon.svg')) {
          return cachedResponse;
        }
        
        // Fetch fresh copy to update cache for next time
        fetch(e.request).then((freshResponse) => {
          if (freshResponse && freshResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, freshResponse));
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // If not in cache, fallback to network
      return fetch(e.request)
        .then((networkResponse) => {
          // If a successful network response, duplicate and cache it dynamically for static resources
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached index for SPA routing if completely offline
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
