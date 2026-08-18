/**
 * 캐시 이름에 들어가는 빌드 버전.
 *
 * `__BUILD_VERSION__`은 빌드 시 `vite.config.ts`의 플러그인이 번들 콘텐츠 해시로 치환한다.
 * 손으로 올리던 값(`v2`)을 쓰면 **배포하고 갱신을 잊었을 때 옛 자산이 그대로 남는다.**
 * 개발 서버에서는 치환되지 않고 placeholder 그대로 쓰이는데, 값이 고정이라 문제되지 않는다.
 */
const CACHE_NAME = 'saonlion-__BUILD_VERSION__'
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
