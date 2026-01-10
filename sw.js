/**
 * MOCIA Service Worker
 * Handles offline functionality and caching
 */

const CACHE_VERSION = 'mocia-v1.14.0';
const CACHE_NAME = `mocia-cache-${CACHE_VERSION}`;

// Files to cache for offline use
const ASSETS_TO_CACHE = [
  '/MOCIA/',
  '/MOCIA/index.html',
  '/MOCIA/domains.html',
  '/MOCIA/exercises.html',
  '/MOCIA/results.html',

  // Shared styles
  '/MOCIA/shared/styles/design-system.css',
  '/MOCIA/shared/styles/components.css',
  '/MOCIA/shared/styles/animations.css',
  '/MOCIA/shared/styles/mobile-first.css',
  '/MOCIA/shared/styles/mobile-optimizations.css',
  '/MOCIA/shared/styles/personalization.css',
  '/MOCIA/shared/styles/feedback.css',

  // Shared JavaScript
  '/MOCIA/shared/js/viewport-fix.js',
  '/MOCIA/shared/js/constants.js',
  '/MOCIA/shared/js/audio-manager.js',
  '/MOCIA/shared/js/data-tracker.js',
  '/MOCIA/shared/js/ui-components.js',
  '/MOCIA/shared/js/difficulty-adapter.js',
  '/MOCIA/shared/js/personalization-service.js',
  '/MOCIA/shared/js/personalization-counter.js',
  '/MOCIA/shared/js/personalization-form.js',
  '/MOCIA/shared/js/settings-modal.js',
  '/MOCIA/shared/js/feedback-modal.js',
  '/MOCIA/shared/js/mobile-debug.js',
  '/MOCIA/shared/js/compatibility-check.js',
  '/MOCIA/shared/utils/statistics.js',

  // Exercise: Word Pair
  '/MOCIA/exercises/word-pair/index.html',
  '/MOCIA/exercises/word-pair/word-list.js',
  '/MOCIA/exercises/word-pair/word-pair.js',
  '/MOCIA/exercises/word-pair/word-pair.css',

  // Exercise: Digit Span
  '/MOCIA/exercises/digit-span/index.html',
  '/MOCIA/exercises/digit-span/digit-span.js',
  '/MOCIA/exercises/digit-span/digit-span.css',

  // Exercise: Visual Search
  '/MOCIA/exercises/visual-search/index.html',
  '/MOCIA/exercises/visual-search/visual-search.js',
  '/MOCIA/exercises/visual-search/visual-search.css',

  // Exercise: Stroop
  '/MOCIA/exercises/stroop/index.html',
  '/MOCIA/exercises/stroop/stroop.js',
  '/MOCIA/exercises/stroop/stroop.css',

  // Exercise: Complex Dual Task
  '/MOCIA/exercises/complex-dual-task/index.html',
  '/MOCIA/exercises/complex-dual-task/complex-dual-task.js',
  '/MOCIA/exercises/complex-dual-task/complex-dual-task.css',

  // Exercise: Task Switching
  '/MOCIA/exercises/task-switching/index.html',
  '/MOCIA/exercises/task-switching/task-switching.js',
  '/MOCIA/exercises/task-switching/task-switching.css',

  // Exercise: Dual N-Back
  '/MOCIA/exercises/dual-n-back/index.html',
  '/MOCIA/exercises/dual-n-back/dual-n-back.js',
  '/MOCIA/exercises/dual-n-back/dual-n-back.css',

  // Exercise: UFOV
  '/MOCIA/exercises/ufov/index.html',
  '/MOCIA/exercises/ufov/ufov.js',
  '/MOCIA/exercises/ufov/ufov.css',

  // Exercise: UFOV Complex
  '/MOCIA/exercises/ufov-complex/index.html',
  '/MOCIA/exercises/ufov-complex/ufov-complex.js',
  '/MOCIA/exercises/ufov-complex/ufov-complex.css',

  // Manifest
  '/MOCIA/manifest.json',
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
