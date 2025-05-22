// Service Worker mínimo para evitar erros 404
// Este service worker está desabilitado intencionalmente

const CACHE_NAME = 'entropia-v1';

// Lista de recursos para cache (vazia por enquanto)
const urlsToCache = [];

self.addEventListener('install', (event) => {
  // Pular a fase de espera e ativar imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remover caches antigos se necessário
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Por enquanto, não fazemos cache de nada
  // Apenas deixamos as requisições passarem normalmente
});