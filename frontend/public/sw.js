const CACHE_VERSION = 'v3';
const STATIC_CACHE = `lemon-billing-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `lemon-billing-runtime-${CACHE_VERSION}`;

// Critical shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/generated/lemon-logo.dim_128x128.png',
  '/assets/generated/pwa-icon-192.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png',
];

// Internet Identity and IC boundary node domains - always bypass to network
const BYPASS_PATTERNS = [
  'identity.ic0.app',
  'identity.internetcomputer.org',
  'ic0.app',
  'icp-api.io',
  'raw.ic0.app',
  'boundary.ic0.app',
];

function shouldBypass(url) {
  return BYPASS_PATTERNS.some((pattern) => url.includes(pattern));
}

function isStaticAsset(url) {
  return (
    url.match(/\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|ico|webp)(\?.*)?$/) ||
    url.includes('/assets/')
  );
}

// ── Install: pre-cache shell + claim immediately ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        // Add each asset individually so one failure doesn't block the rest
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Pre-cache failed for ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches + claim clients immediately ────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ── Fetch: smart caching strategies ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests
  if (!url.startsWith('http')) return;

  // Always bypass Internet Identity and IC canister calls
  if (shouldBypass(url)) return;

  // ── Navigation requests (HTML pages) ──────────────────────────────────────
  // Cache-first: serve cached index.html as app shell when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match('/index.html').then((cached) => {
          // Try network first, fall back to cached shell
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
                cache.put('/index.html', response.clone());
              }
              return response;
            })
            .catch(() => {
              // Offline: serve cached shell
              return cached || cache.match('/');
            });
        });
      })
    );
    return;
  }

  // ── Static assets (JS bundles, CSS, images, fonts) ────────────────────────
  // Cache-first: serve from cache, update in background
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            // Revalidate in background
            fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  cache.put(request, response.clone());
                }
              })
              .catch(() => {});
            return cached;
          }
          // Not in cache: fetch and cache
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
        });
      })
    );
    return;
  }

  // ── Everything else: network-first with cache fallback ────────────────────
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          return cache.match(request);
        });
    })
  );
});

// ── Message: force update ─────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
