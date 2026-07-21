// Cognita service worker.
//
// Cognita has no server and no API to call — every asset it needs is either
// part of the build or generated locally, so caching strategy is simple:
//   - App-shell essentials (the HTML entry point, manifest, icons, fonts)
//     are precached on install, since they're known ahead of time and rarely
//     change.
//   - Hashed build assets (JS/CSS under /assets/) aren't known at
//     service-worker-authoring time, so they're cached opportunistically
//     the first time they're fetched (stale-while-revalidate) — after one
//     online visit, the whole app works offline.
//   - Navigations fall back to the cached shell so reloading any in-app
//     route while offline still boots the SPA.

const CACHE_VERSION = 'cognita-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-512.png',
  '/icons/apple-touch-icon.png',
  '/fonts/young-serif-400.woff2',
  '/fonts/ibm-plex-sans-400.woff2',
  '/fonts/ibm-plex-sans-500.woff2',
  '/fonts/ibm-plex-sans-600.woff2',
  '/fonts/ibm-plex-sans-700.woff2',
  '/fonts/ibm-plex-mono-400.woff2',
  '/fonts/ibm-plex-mono-500.woff2',
  '/fonts/ibm-plex-mono-600.woff2',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_VERSION)
    cache.put(request, response.clone())
    return response
  } catch {
    const cache = await caches.open(CACHE_VERSION)
    return (await cache.match(request)) || (await cache.match('/index.html'))
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION)
  const cached = await cache.match(request)
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)

  return cached || networkFetch
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})
