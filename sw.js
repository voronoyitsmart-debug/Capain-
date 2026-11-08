// Офлайн-кэш. Версия, префикс и список файлов подставляются при сборке.
// Несколько приложений живут на одном сайте (немецкий в корне, румынский в /ro/),
// поэтому каждое трогает только свои кэши и не обслуживает чужие папки.
const PREFIX = 'capain';
const CACHE = PREFIX + '-6ba4dff41a';
const FONTS = PREFIX + '-fonts';
const ASSETS = ["./","index.html","app.css?v=6ba4dff41a","app.js?v=6ba4dff41a","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","icons/favicon.png","data-de.js?v=6ba4dff41a","data-ro.js?v=6ba4dff41a"];
const EXCLUDE = ["ro/"];
const LEGACY = ["deutsch","romana"];   // кэши прежних отдельных приложений
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(PREFIX + '-') && k !== CACHE && k !== FONTS) || LEGACY.some(p => k.startsWith(p + '-'))).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // шрифты Google: из кэша, с обновлением в фоне
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scope) || EXCLUDE.some(p => url.pathname.startsWith(scope + p))) return;
  // страница: сначала сеть (чтобы быстро получать обновления), без сети — кэш
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html', { cacheName: CACHE })));
    return;
  }
  e.respondWith(caches.match(e.request, { cacheName: CACHE }).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
