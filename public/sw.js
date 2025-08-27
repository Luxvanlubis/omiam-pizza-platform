/**
 * 🚀 SERVICE WORKER O'MIAM - PWA AVANCÉE
 * =====================================
 * Gestion complète du cache, notifications push, synchronisation offline
 * Version: 1.0.0 | Date: 2025-01-27
 */

// =============================================================================
// 🔧 CONFIGURATION
// =============================================================================

const CACHE_NAME = 'omiam-v1.0.0';
const STATIC_CACHE = 'omiam-static-v1';
const DYNAMIC_CACHE = 'omiam-dynamic-v1';
const API_CACHE = 'omiam-api-v1';
const IMAGE_CACHE = 'omiam-images-v1';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/menu',
  '/about',
  '/contact',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/inter-var.woff2',
  '/images/logo.webp',
  '/images/hero-pizza.webp'
];

// Routes API à mettre en cache
const API_ROUTES = [
  '/api/menu',
  '/api/restaurants',
  '/api/categories'
];

// Stratégies de cache
const cacheStrategies = { // Cache first with network fallback pour les assets statiques static: async (request) => { const cache = await caches.open(STATIC_CACHE_NAME); const cached = await cache.match(request); if (cached) { return cached; } try { const network = await fetch(request); if (network.status === 200) { cache.put(request, network.clone()); } return network; } catch (error) { return new Response('Offline', { status: 503 }); } }, // Network first with cache fallback pour les API api: async (request) => { try { const network = await fetch(request); if (network.status === 200) { const cache = await caches.open(API_CACHE_NAME); cache.put(request, network.clone()); } return network; } catch (error) { const cache = await caches.open(API_CACHE_NAME); const cached = await cache.match(request); return cached || new Response('Offline', { status: 503 }); } }, // Cache first avec revalidation pour les images image: async (request) => { const cache = await caches.open(IMAGE_CACHE_NAME); const cached = await cache.match(request); if (cached) { // Revalidation en arrière-plan fetch(request).then(network => { if (network.status === 200) { cache.put(request, network); } }); return cached; } try { const network = await fetch(request); if (network.status === 200) { cache.put(request, network.clone()); } return network; } catch (error) { return new Response('Image not available', { status: 404 }); } }
};

/**
 * 📦 Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker O\'Miam - Installation...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Préparation du cache dynamique
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker installé avec succès');
      return self.skipWaiting();
    })
  );
});

/**
 * 🔄 Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker O\'Miam - Activation...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activé et opérationnel');
      notifyClients({
        type: 'SW_ACTIVATED',
        message: 'O\'Miam est maintenant disponible hors ligne! 🍕'
      });
    })
  );
});

/**
 * 🌐 Interception des requêtes réseau
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (!request.url.startsWith('http')) return;
  
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

/**
 * 📱 Gestion des notifications push
 */
self.addEventListener('push', (event) => {
  console.log('📱 Notification push reçue');
  
  let notificationData = {
    title: 'O\'Miam',
    body: 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'omiam-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// =============================================================================
// 🛠️ FONCTIONS UTILITAIRES
// =============================================================================

/**
 * 🧹 Nettoyage des anciens caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (!validCaches.includes(cacheName)) {
        console.log('🗑️ Suppression ancien cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

/**
 * 📡 Gestion des requêtes API
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({
        error: 'Données indisponibles hors ligne',
        offline: true,
        timestamp: Date.now()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * 🖼️ Gestion des requêtes d'images
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image indisponible</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * 📄 Gestion des requêtes de pages
 */
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const offlinePage = await cache.match('/offline');
    
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>O'Miam - Hors ligne</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
            .logo { font-size: 2em; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="logo">🍕 O'Miam</div>
          <h1 class="offline">Vous êtes hors ligne</h1>
          <p>Cette page n'est pas disponible sans connexion internet.</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

/**
 * 🔧 Gestion des ressources statiques
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Ressource indisponible', { status: 404 });
  }
}

/**
 * 🔍 Détection du type de requête
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         /\.(js|css|woff|woff2|ttf|eot)$/i.test(request.url);
}

/**
 * 📢 Notification aux clients
 */
function notifyClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}

console.log('🚀 Service Worker O\'Miam chargé - Version 1.0.0');

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => { console.log('Service Worker: Notification clicked'); const notification = event.notification; const action = event.action; const data = notification.data || {}; // Fermer la notification notification.close(); // Gérer les actions if (action === 'dismiss') { console.log('Service Worker: Notification dismissed'); return; } // Déterminer l'URL de destination let targetUrl = data.url || '/'; if (action === 'view' && data.orderId) { targetUrl = `/orders/${data.orderId}`; } else if (data.type === 'ORDER_STATUS_UPDATE' && data.orderId) { targetUrl = `/orders/${data.orderId}`; } else if (data.type === 'PROMOTION') { targetUrl = '/promotions'; } else if (data.type === 'NEW_PRODUCT') { targetUrl = '/menu'; } // Ouvrir ou focuser la fenêtre appropriée event.waitUntil( clients.matchAll({ type: 'window', includeUncontrolled: true }) .then((clientList) => { // Chercher une fenêtre existante avec l'URL cible for (const client of clientList) { if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) { return client.focus(); } } // Chercher une fenêtre de l'application for (const client of clientList) { if (client.url.includes(self.location.origin) && 'navigate' in client) { return client.navigate(targetUrl).then(() => client.focus()); } } // Ouvrir une nouvelle fenêtre if (clients.openWindow) { return clients.openWindow(targetUrl); } }) );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => { console.log('Service Worker: Notification closed'); const notification = event.notification; const data = notification.data || {}; // Optionnel: Envoyer des analytics sur la fermeture if (data.trackingId) { fetch('/api/analytics/notification-closed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingId: data.trackingId, timestamp: Date.now() }) }).catch((error) => { console.error('Service Worker: Error tracking notification close:', error); }); }
});

// Gestion des messages
self.addEventListener('message', (event) => { if (event.data && event.data.type === 'SKIP_WAITING') { self.skipWaiting(); } // Gestion des messages pour les notifications if (event.data && event.data.type === 'NOTIFICATION_PERMISSION') { console.log('Notification permission:', event.data.permission); } if (event.data && event.data.type === 'ORDER_UPDATE') { console.log('Order update:', event.data.order); } if (event.data && event.data.type === 'GET_VERSION') { event.ports[0].postMessage({ version: CACHE_NAME }); } if (event.data && event.data.type === 'CLEAR_CACHE') { Promise.all([ caches.delete(CACHE_NAME), caches.delete(STATIC_CACHE_NAME), caches.delete(IMAGE_CACHE_NAME), caches.delete(API_CACHE_NAME) ]).then(() => { event.ports[0].postMessage({ success: true }); }).catch((error) => { event.ports[0].postMessage({ success: false, error: error.message }); }); } // Nettoyage du cache périodique if (event.data && event.data.type === 'CLEANUP_CACHE') { caches.keys().then(cacheNames => { cacheNames.forEach(cacheName => { caches.open(cacheName).then(cache => { cache.keys().then(keys => { // Supprimer les anciennes entrées (plus de 30 jours) const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000); keys.forEach(request => { const url = new URL(request.url); const timestamp = parseInt(url.searchParams.get('timestamp') || '0'); if (timestamp < thirtyDaysAgo) { cache.delete(request); } }); }); }); }); }); }
});