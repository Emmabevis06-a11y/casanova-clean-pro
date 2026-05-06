// Service Worker — Casanova Clean Pro
const CACHE = 'casanova-v1';
const ASSETS = [
  '/casanova-clean-pro/casanova-clean-pro.html',
  '/casanova-clean-pro/manifest.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // Pour Firebase : toujours réseau
  if(e.request.url.includes('firebase') || e.request.url.includes('googleapis')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
