// Service Worker for Homework Helper PWA
const CACHE_NAME = 'homework-helper-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();

        // Open cache and store the response
        caches.open(CACHE_NAME)
          .then(cache => {
            // Only cache successful responses
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(_ => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
});