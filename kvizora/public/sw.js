// © Платон Вороний. All rights reserved. See LICENSE.
// Kvizora service worker: lets phones add the app to the home screen and opens fast.
// Only the app's own files (styles, scripts, icons, formula fonts) are kept offline. Pages and answers always go to
// the server, so a test is never taken or graded from an old copy; without a connection a short "no connection" page shows.
const CACHE = 'kvizora-v2';
const STATIC = /^\/(css|js|icons|vendor)\//;
const OFFLINE = '/offline.html';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([OFFLINE, '/css/app.css', '/icons/icon-192.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (STATIC.test(url.pathname)) {
    // the app's files: fresh from the server when possible, the saved copy when offline
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req)));
    return;
  }
  if (req.mode === 'navigate') e.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
});
