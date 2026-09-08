/* Diggle Coding Club service worker.
   Goal: once a device has loaded the app + Python once, a wobbly classroom
   wifi shouldn't stop the lesson. */
/* eslint-disable */

const VERSION = "v1";
const STATIC_CACHE = `diggle-static-${VERSION}`;
const RUNTIME_CACHE = `diggle-runtime-${VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isPyodide(url) {
  return url.pathname.startsWith("/pyodide/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/pyodide-worker.js" ||
    /\.(woff2?|png|svg|ico|css|js)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API or data calls — always fresh.
  if (url.pathname.startsWith("/api/")) return;

  // Pyodide + static assets: cache-first (they're content-hashed or versioned).
  if (isPyodide(url) || isStaticAsset(url)) {
    event.respondWith(
      caches.open(isPyodide(url) ? RUNTIME_CACHE : STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Page navigations: network-first, fall back to a cached copy if offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, res.clone());
          return res;
        } catch {
          const cache = await caches.open(RUNTIME_CACHE);
          const hit = await cache.match(request);
          if (hit) return hit;
          return new Response(
            "<h1>You're offline</h1><p>Reconnect and try again.</p>",
            { headers: { "Content-Type": "text/html" }, status: 503 },
          );
        }
      })(),
    );
  }
});
