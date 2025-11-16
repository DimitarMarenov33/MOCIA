/**
 * MOCIA Service Worker
 * Handles offline functionality and caching
 */

const CACHE_VERSION = 'mocia-v1.0.0';
const CACHE_NAME = `mocia-cache-${CACHE_VERSION}`;

// Files to cache for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/domains.html',
  '/exercises.html',

  // Shared styles
  '/shared/styles/design-system.css',
  '/shared/styles/components.css',
  '/shared/styles/animations.css',
  '/shared/styles/mobile-first.css',

  // Shared JavaScript
  '/shared/js/constants.js',
  '/shared/js/audio-manager.js',
  '/shared/js/data-tracker.js',
  '/shared/js/ui-components.js',
  '/shared/utils/statistics.js',

  // Exercise: Word Pair
  '/exercises/word-pair/index.html',
  '/exercises/word-pair/word-list.js',
  '/exercises/word-pair/word-pair.js',

  // Exercise: Digit Span
  '/exercises/digit-span/index.html',
  '/exercises/digit-span/digit-span.js',
  '/exercises/digit-span/digit-span.css',

  // Exercise: Visual Search
  '/exercises/visual-search/index.html',
  '/exercises/visual-search/visual-search.js',
  '/exercises/visual-search/visual-search.css',

  // Exercise: Stroop
  '/exercises/stroop/index.html',
  '/exercises/stroop/stroop.js',
  '/exercises/stroop/stroop.css',

  // Exercise: Complex Dual Task
  '/exercises/complex-dual-task/index.html',
  '/exercises/complex-dual-task/complex-dual-task.js',
  '/exercises/complex-dual-task/complex-dual-task.css',

  // Exercise: Task Switching
  '/exercises/task-switching/index.html',
  '/exercises/task-switching/task-switching.js',
  '/exercises/task-switching/task-switching.css',

  // Exercise: Dual N-Back
  '/exercises/dual-n-back/index.html',
  '/exercises/dual-n-back/dual-n-back.js',
  '/exercises/dual-n-back/dual-n-back.css',

  // Exercise: UFOV
  '/exercises/ufov/index.html',
  '/exercises/ufov/ufov.js',
  '/exercises/ufov/ufov.css',

  // Exercise: UFOV Complex
  '/exercises/ufov-complex/index.html',
  '/exercises/ufov-complex/ufov-complex.js',
  '/exercises/ufov-complex/ufov-complex.css',

  // Manifest
  '/manifest.json',
];

/**
 * Install Event - Cache assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch Event - Serve from cache, fallback to network
 * Strategy: Cache First (good for offline-first apps)
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response for future use (only for GET requests)
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);

            // Return offline page if available
            return caches.match('/index.html');
          });
      })
  );
});

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
