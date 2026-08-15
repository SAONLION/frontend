const CACHE_NAME = 'saonlion-runtime-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/saonlion-app-icon.svg']

function canCache(response) {
  return response && response.ok && response.type === 'basic'
}

function isStaticAsset(request, url) {
  return ['image', 'script', 'style', 'font'].includes(request.destination)
    || url.pathname.startsWith('/models/')
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (canCache(response)) {
            void caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', response.clone()))
          }
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  if (!isStaticAsset(request, url)) {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (canCache(response)) {
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
        }
        return response
      })

      if (cached) {
        event.waitUntil(network.catch(() => undefined))
        return cached
      }

      return network
    }),
  )
})
