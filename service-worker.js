const CACHE_NAME = "farroupilha-cache-v2";
const ASSETS = [
  "/",                // raiz
  "/index.html",
  "/manifest.json",
  "/service-worker.js",
  // ícones do PWA (se tiveres na pasta /icons ou raiz, adiciona aqui também)
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  // CDN usado (Tailwind)
  "https://cdn.tailwindcss.com"
];

// Instalação: pré-cache dos arquivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fallback para rede
self.addEventListener("fetch", event => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) return cachedRes;
      return fetch(req).then(netRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, netRes.clone());
          return netRes;
        });
      }).catch(() => cachedRes);
    })
  );
});
