// ── STUDIO APP SERVICE WORKER ──
// Makes the dashboard installable ("Add to Home Screen") and handles push
// notifications. It never serves an old dashboard: the page always comes from
// the network first; the saved copy is used only when the phone is offline.
// Data (Supabase, the server) is never cached here.
const CACHE = 'studio-v1';
const SHELL = '/pages/dashboard';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;   // only the page itself
  const url = new URL(req.url);
  if (!url.pathname.startsWith('/pages/dashboard')) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-store' });
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(SHELL, copy)).catch(() => {});
      }
      return res;
    } catch (err) {
      const cached = await caches.match(SHELL);
      return cached || new Response('<h3 style="font-family:sans-serif;padding:2rem">You are offline. Open Studio again when you have internet.</h3>', { headers: { 'Content-Type': 'text/html' } });
    }
  })());
});

// ── PUSH ──
// Payload from the server: { title, body, tag, url, badge }
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Studio', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    if (typeof d.badge === 'number' && self.navigator && self.navigator.setAppBadge) {
      try { d.badge > 0 ? await self.navigator.setAppBadge(d.badge) : await self.navigator.clearAppBadge(); } catch (err) {}
    }
    await self.registration.showNotification(d.title || 'Studio', {
      body: d.body || '',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      icon: '/pages/studio-icon-192.png',
      badge: '/pages/studio-icon-192.png',
      data: { url: d.url || '/pages/dashboard' }
    });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/pages/dashboard';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes('/pages/dashboard')) {
        c.postMessage({ type: 'open', url: target });
        return c.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
