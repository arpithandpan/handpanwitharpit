// Practice page: works offline after the first visit.
// The page and its script come from the network when online (so updates show at once)
// and from this cache when offline.
const CACHE = 'practice-v23';
const FILES = ['/pages/practice', '/js/practice.js?v=23', '/fonts/cormorant-garamond-latin-600-normal.woff2', '/fonts/cormorant-garamond-latin-600-italic.woff2', '/fonts/figtree-latin-400-normal.woff2', '/fonts/figtree-latin-500-normal.woff2', '/fonts/figtree-latin-600-normal.woff2', '/favicon.svg?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('practice-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' && url.pathname.startsWith('/pages/practice');
  const isOurs = isPage || FILES.includes(url.pathname + url.search);
  if (!isOurs) return;
  e.respondWith((async () => {
    const key = isPage ? '/pages/practice' : url.pathname + url.search;
    try {
      const res = await fetch(req, { cache: 'no-store' });
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
      return res;
    } catch (err) {
      const hit = await caches.match(key);
      return hit || new Response('You are offline. Open Practice again when you are online.', { headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});
