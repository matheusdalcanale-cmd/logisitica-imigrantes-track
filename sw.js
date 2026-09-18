// Service Worker do LogiTrack Pro
//
// Objetivo: tornar o app instalável (PWA) e deixar o "shell" (HTML, ícones,
// manifest) disponível mesmo com internet instável, SEM interferir nos dados
// reais do Firebase/Firestore. Por isso, o Firebase/Firestore (autenticação e
// dados em tempo real) SEMPRE vai direto pra rede — nunca é cacheado aqui.
//
// v2: além do próprio site, agora também cacheamos (mesma estratégia
// stale-while-revalidate) os arquivos estáticos de terceiros que formam a
// aparência do app: Tailwind (CDN), Font Awesome e Google Fonts (CSS +
// arquivos de fonte que eles carregam). Antes, esses três só iam direto pra
// rede e nunca ficavam no cache — então, sem internet, o HTML abria mas
// aparecia sem nenhum estilo/ícone (o Tailwind gera as classes via
// JavaScript, então "sem Tailwind" = página praticamente sem aparência
// nenhuma). Com isso corrigido, depois da primeira visita online o app fica
// visualmente utilizável mesmo offline.

const CACHE_NAME = 'logitrack-shell-v3';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
];

// Origens de terceiros cujos arquivos estáticos (CSS/JS/fontes) podem ser
// cacheados com segurança — são só aparência, nunca dados do usuário.
// Firebase/Firestore/Auth NÃO entram nessa lista de propósito.
const CACHEABLE_THIRD_PARTY_ORIGINS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
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

    // Cuida de requisições GET para o próprio site (mesma origem) OU para as
    // origens de terceiros liberadas acima (Tailwind, Font Awesome, Google
    // Fonts). Firebase Auth/Firestore continua indo direto pra rede, sem
    // passar pelo cache — dado em tempo real não deve ficar preso em cache.
    const isCacheableRequest =
        request.method === 'GET' &&
        (url.origin === self.location.origin || CACHEABLE_THIRD_PARTY_ORIGINS.includes(url.origin));

    if (!isCacheableRequest) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    // Requisições cross-origin sem o atributo "crossorigin" no
                    // HTML chegam aqui como resposta "opaque" (status 0, sem
                    // acesso ao conteúdo) — isso é normal e esperado para o
                    // Tailwind/Font Awesome/Google Fonts; ainda dá pra
                    // cachear e reservir depois, só não dá pra inspecionar.
                    if (response && (response.status === 200 || response.type === 'opaque')) {
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
