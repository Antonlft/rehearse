/* Offline support. The site saves a copy of itself on the device, so it opens and works with no signal.
   - Online, every file comes from the network first, so updates arrive as soon as they're published; the saved copy
     is refreshed as files load. If the network is slow (over 4 seconds) and a saved copy exists, that copy is used.
   - Offline, the saved copy is used.
   - On first install, the page and every script and stylesheet it links are saved straight away.
   Saved progress lives in localStorage ("rehearse.v3") and is never touched here.
   Off switch: if a saved copy ever gets stuck, set KILL to true and deploy. Every browser then deletes the saved
   copy and removes this worker on its next visit, and the site works as it did before offline support. */
const KILL = false;
const CACHE = "rehearse-offline-1";
const SCOPE = new URL("./", self.location).href; // e.g. https://antonlft.github.io/rehearse/
const SLOW_MS = 4000;

self.addEventListener("install", e => {
  self.skipWaiting();
  if (KILL) return;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch(SCOPE, { cache: "no-cache" });
    if (!res.ok) return;
    const html = await res.clone().text();
    await cache.put(SCOPE, res);
    // Every script, stylesheet, icon and the manifest that the page links, with their ?v= stamps.
    const links = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
      .filter(u => !/^(https?:|data:|#|mailto:)/.test(u));
    const extra = ["favicon.svg", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];
    await Promise.all([...new Set([...links, ...extra])].map(async u => {
      try { const r = await fetch(new URL(u, SCOPE), { cache: "no-cache" }); if (r.ok) await store(cache, new URL(u, SCOPE), r); } catch {}
    }));
  })());
});

self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (KILL || k !== CACHE) await caches.delete(k);
  if (KILL) { await self.registration.unregister(); return; }
  await self.clients.claim();
})()));

// Save a response, dropping older copies of the same file (a different ?v= stamp), so the cache never grows.
async function store(cache, url, res) {
  for (const k of await cache.keys()) {
    const ku = new URL(k.url);
    if (ku.pathname === url.pathname && ku.search !== url.search) await cache.delete(k);
  }
  await cache.put(url.href, res);
}

// Network first; fall back to the saved copy when offline, or when the network is slow and a copy exists.
async function networkFirst(req, key, fallback) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then(async res => {
    if (res.ok && (res.type === "basic" || res.type === "default")) await store(cache, new URL(key), res.clone());
    return res;
  });
  net.catch(() => {}); // if the saved copy was used, a later network failure needs no handling
  const saved =() => cache.match(key).then(r => r || (fallback ? cache.match(fallback) : undefined));
  const slow = new Promise(r => setTimeout(r, SLOW_MS, "slow"));
  try {
    const first = await Promise.race([net, slow]);
    if (first !== "slow") return first;
    const copy = await saved();
    return copy || await net;
  } catch {
    const copy = await saved();
    if (copy) return copy;
    throw new Error("offline and not saved");
  }
}

// Fonts from Google: saved the first time they load, then used from the saved copy.
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") await cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", e => {
  if (KILL) return;
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") return e.respondWith(cacheFirst(req));
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;
  if (req.mode === "navigate") {
    // Pages are saved under their address without "?..." (e.g. ?page=formulas). A page that was never saved falls
    // back to the home page, unless it's a file such as the PDF.
    const key = url.origin + url.pathname;
    const isFile = /\.[a-z0-9]+$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname);
    return e.respondWith(networkFirst(req, key, isFile ? null : SCOPE));
  }
  e.respondWith(networkFirst(req, url.href, null));
});
