// Minimal service worker for the portfolio. Precaches the shell, then
// network-first for navigations (fall back to cache, then /offline) and
// cache-first for hashed Next static assets.
const CACHE = "portfolio-v1"
// Paths must match what the static export actually serves. next.config.mjs sets
// `trailingSlash: true`, so pages are emitted as `blog/index.html` and served at
// `/blog/`; the non-slash forms 301-redirect on GitHub Pages, and a redirected
// response makes the atomic `cache.addAll()` reject — which aborts install and
// leaves the SW permanently uninstalled. Keep these trailing slashes in sync.
const PRECACHE = ["/", "/blog/", "/offline/", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Cache-first for hashed static assets.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return res
          })
      )
    )
    return
  }

  // Network-first for navigations; fall back to cache, then /offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/offline/")))
    )
  }
})
