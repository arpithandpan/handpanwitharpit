// ── STUDIO APP SERVICE WORKER ──
// Makes the dashboard installable ("Add to Home Screen") and handles push
// notifications. v197: opening the app shows the saved page at once and refreshes it in
// the background (an update link with ?u= always goes to the network first).
// Data (Supabase, the server) is never cached here.
const CACHE = 'studio-v3';   // v194: push also wakes the open app
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
  const fromNet = async () => {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(SHELL, copy)).catch(() => {}); }
    return res;
  };
  const offline = () => new Response('<h3 style="font-family:sans-serif;padding:2rem;background:#0b0b0e;color:#eee;margin:0;min-height:100vh">You are offline. Open Studio again when you have internet.</h3>', { headers: { 'Content-Type': 'text/html' } });
  // v197: an update (?u=…) always comes from the network, so "Update" really loads the new version.
  if (url.searchParams.has('u')) { e.respondWith(fromNet().catch(async () => (await caches.match(SHELL)) || offline())); return; }
  // v197: opening the app shows the saved page instantly (no grey gap while the network answers)
  // and refreshes the saved copy in the background. The app's own version check shows
  // "A new version is ready" when that copy is older than the live one.
  e.respondWith((async () => {
    const cached = await caches.match(SHELL);
    const net = fromNet();
    if (cached) { e.waitUntil(net.catch(() => {})); return cached; }
    try { return await net; } catch (err) { return offline(); }
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
    // v194: tell any open Studio window, so it refreshes the inbox and badge right away.
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) if (c.url.includes('/pages/dashboard')) c.postMessage({ type: 'push', tag: d.tag || '', url: d.url || '' });
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
