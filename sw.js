// Service Worker do LogiTrack Pro
//
// Objetivo: tornar o app instalável (PWA) e deixar o "shell" (HTML, ícones,
// manifest) disponível mesmo com internet instável, SEM interferir nos dados
// reais do Firebase/Firestore. Por isso, só o shell é cacheado; qualquer
// outra requisição (Firebase, Google Fonts, CDN de scripts) vai direto pra
// rede, do jeito que já funcionava antes.

const CACHE_NAME = 'logitrack-shell-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só cuida de requisições GET para o próprio site (mesma origem).
  // Firebase Auth/Firestore, Tailwind CDN, Google Fonts e Font Awesome
  // continuam indo direto pra rede, sem passar pelo cache.
  const isShellRequest =
    request.method === 'GET' &&
    url.origin === self.location.origin;

  if (!isShellRequest) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      // Serve do cache na hora (rápido / funciona offline) e atualiza em
      // segundo plano quando a rede responder (stale-while-revalidate).
      return cached || network;
    })
  );
});
