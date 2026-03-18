const CACHE_NAME = 'lubricentro-v1';

const ASSETS = [
  '/lubricentromelgar.github.io/',
  '/lubricentromelgar.github.io/index.html',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Instalación: cachear recursos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: red primero, cache como respaldo
self.addEventListener('fetch', event => {
  // No interceptar peticiones a Firebase (necesitan red siempre)
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('identitytoolkit') ||
      event.request.url.includes('securetoken')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia fresca en cache
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin red: usar cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback para navegación
          if (event.request.mode === 'navigate') {
            return caches.match('/lubricentromelgar.github.io/index.html');
          }
        });
      })
  );
});
