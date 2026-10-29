// Service Worker: Offline-Betrieb + schnelle Updates.
// - Die Seite selbst (Navigation) wird zuerst aus dem Netz geladen, damit
//   neue Versionen sofort ankommen; offline aus dem Zwischenspeicher.
// - Übrige Dateien (mit Versions-Namen) zuerst aus dem Cache.
const CACHE = 'lenas-stundenzettel-v2'
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (new URL(req.url).origin !== self.location.origin) return

  // Navigation: zuerst Netzwerk (Updates sofort), offline -> Cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return res
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./'))),
    )
    return
  }

  // übrige Dateien: zuerst Cache, im Hintergrund aktualisieren
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached || caches.match('./'))
      return cached || network
    }),
  )
})
