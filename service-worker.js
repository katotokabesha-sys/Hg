const CACHE_NAME = 'lbk-smart-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/base.css',
  '/assets/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
