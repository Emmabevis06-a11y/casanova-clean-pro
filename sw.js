const CACHE = 'casanova-v4';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Est-ce la page de l'application elle-même ?
function estPageApp(req) {
  return req.mode === 'navigate'
      || req.destination === 'document'
      || req.url.indexOf('index.html') >= 0;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  if (url.indexOf('firebase') >= 0 ||
      url.indexOf('googleapis') >= 0 ||
      url.indexOf('gstatic') >= 0 ||
      url.indexOf('cloudinary') >= 0) {
    return;
  }

  // L'APPLICATION : le réseau d'abord.
  // La dernière version mise en ligne gagne toujours ; le cache ne sert que hors connexion.
  // C'est ce qui rend inutile de changer le numéro de version à chaque déploiement.
  if (estPageApp(req)) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copie = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copie)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match(req)))
    );
    return;
  }

  // LE RESTE (manifest, icônes) : le cache d'abord, le réseau en secours.
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
