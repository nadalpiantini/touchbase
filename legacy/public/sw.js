/**
 * TouchBase Service Worker - PWA Offline Support
 * Enables offline attendance tracking and basic caching
 */

const CACHE_VERSION = 'touchbase-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/touchbase/',
  '/touchbase/schedule',
  '/touchbase/attendance',
  '/touchbase/roster',
  '/touchbase/teams',
  '/main/css/themes/clubball/ui.css',
  '/main/css/themes/clubball/tokens.css',
  '/touchbase/manifest.webmanifest',
];

// API endpoints to queue for offline sync
const SYNC_ENDPOINTS = [
  '/touchbase/api/attendance',
  '/touchbase/api/schedule',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
        // Don't fail installation if some assets can't be cached
      });
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 * Strategy: Network First for API, Cache First for static assets
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/touchbase/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response and cache it
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed - try cache
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline fallback for API
            return new Response(
              JSON.stringify({
                offline: true,
                error: 'No network connection',
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache First strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      // Not in cache - fetch from network and cache dynamically
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

/**
 * Background Sync - Queue offline attendance submissions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncOfflineAttendance());
  }
});

/**
 * Sync queued attendance records
 */
async function syncOfflineAttendance() {
  const db = await openOfflineDB();
  const tx = db.transaction('attendance_queue', 'readonly');
  const store = tx.objectStore('attendance_queue');
  const records = await store.getAll();

  console.log('[SW] Syncing', records.length, 'offline attendance records');

  for (const record of records) {
    try {
      const response = await fetch('/touchbase/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record.data),
      });

      if (response.ok) {
        // Delete synced record
        const deleteTx = db.transaction('attendance_queue', 'readwrite');
        await deleteTx.objectStore('attendance_queue').delete(record.id);
        console.log('[SW] Synced attendance record:', record.id);
      }
    } catch (error) {
      console.warn('[SW] Failed to sync record:', record.id, error);
    }
  }
}

/**
 * Open IndexedDB for offline queue
 */
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TouchBaseOffline', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('attendance_queue')) {
        db.createObjectStore('attendance_queue', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Message event - handle commands from clients
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
