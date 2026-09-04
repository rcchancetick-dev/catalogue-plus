const CACHE_NAME = 'catalogueplus-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = ['/', '/catalogue', '/connexion', '/offline.html', '/manifest.json'];
self.addEventListener('install', (event) => { self.skipWaiting(); event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) { event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'Hors-ligne : connectez-vous au serveur local.' }), { headers: { 'Content-Type': 'application/json' }, status: 503 }))); return; }
  event.respondWith(caches.match(request).then((cached) => {
    const networked = fetch(request).then((response) => { if (response && response.status === 200) { const clone = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)); } return response; }).catch(() => cached || caches.match(OFFLINE_URL));
    return cached || networked;
  }));
});
