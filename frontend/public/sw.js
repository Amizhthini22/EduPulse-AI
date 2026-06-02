// EduPulse AI - Service Worker for offline support
const CACHE_NAME = 'edupulse-v1';

// Assets to cache for offline shell
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API endpoints to cache with stale-while-revalidate
const API_CACHE_NAME = 'edupulse-api-v1';
const CACHEABLE_API = [
  '/api/students',
  '/api/dashboard/stats',
  '/api/dashboard/insights',
  '/api/dashboard/groupings',
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first for shell, stale-while-revalidate for API GET requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // API caching strategy: stale-while-revalidate
  const isApiRequest = CACHEABLE_API.some((path) => url.pathname.startsWith(path));
  if (isApiRequest) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached); // fall back to cache if network fails

        // Return cached immediately if available, then update in background
        return cached || networkFetch;
      })
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
