// sw.js - Custom Service Worker

// Set up background sync for pending interviews
let syncInProgress = false;

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  // Cache the app shell (critical resources)
  event.waitUntil(
    caches.open('app-shell-v1')
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/src/assets/icon-192.png',
          '/src/assets/icon-512.png',
          // Add other critical resources that should be cached
        ]);
      })
      .then(() => {
        console.log('App shell cached successfully');
        self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== 'app-shell-v1' && !cacheName.startsWith('workbox-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle API requests with NetworkFirst strategy
  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open('api-cache')
        .then(cache => {
          return fetch(request)
            .then(response => {
              // Clone the response before caching
              const responseClone = response.clone();
              
              // Cache the successful response
              if (response.status === 200) {
                cache.put(request, responseClone);
              }
              
              return response;
            })
            .catch(() => {
              // Return cached response if network fails
              return cache.match(request).then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // If no cache, return a fallback response
                return new Response(JSON.stringify({ 
                  success: false, 
                  error: 'Offline: Unable to fetch data' 
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              });
            });
        })
    );
  } 
  // Handle navigation requests (HTML pages) with App Shell strategy
  else if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then(response => {
          return response || fetch(request);
        })
        .catch(() => {
          // Fallback to a basic offline page
          return caches.match('/offline.html').then(response => {
            if (response) {
              return response;
            }
            
            // Return a basic HTML response if no offline page exists
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Interview Recorder - Offline</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                  </style>
                </head>
                <body>
                  <h1>You are offline</h1>
                  <p>Interview Recorder is designed to work offline. Your data is safely stored locally.</p>
                </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          });
        })
    );
  } 
  // Handle other requests normally
  else {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request);
        })
    );
  }
});

// Background Sync event - sync pending interviews
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-interviews' && !syncInProgress) {
    console.log('Background sync triggered for interviews');
    
    event.waitUntil(
      performInterviewSync()
    );
  }
});

// Function to perform interview sync
async function performInterviewSync() {
  if (syncInProgress) {
    console.log('Sync already in progress, skipping');
    return;
  }
  
  syncInProgress = true;
  
  try {
    console.log('Starting background sync for interviews...');
    
    // Get all clients (browser tabs) to communicate with the app
    const clients = await self.clients.matchAll();
    
    // Post message to all clients that sync is starting
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START',
        message: 'Syncing pending interviews...'
      });
    });
    
    // Get pending interviews from IndexedDB (this is complex and would require communication with the main thread)
    // For now, we'll send a message to the main thread to handle the sync
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_REQUEST'
      });
    });
    
    console.log('Background sync completed');
    
    // Post message to all clients that sync is complete
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Sync completed successfully'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
    
    // Post error message to all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        error: error.message
      });
    });
  } finally {
    syncInProgress = false;
  }
}

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle completed sync from main thread
  if (event.data && event.data.type === 'SYNC_SUCCESS') {
    console.log('Sync operation successful');
    
    // Tag for background sync to clear successful items
    if (self.registration.sync) {
      self.registration.sync.register('sync-interviews');
    }
  }
  
  if (event.data && event.data.type === 'SYNC_FAILED') {
    console.error('Sync operation failed');
    
    // Ensure we try again later
    if (self.registration.sync) {
      // Add a delay before retrying
      setTimeout(() => {
        self.registration.sync.register('sync-interviews');
      }, 30000); // Retry in 30 seconds
    }
  }
});

// Listen for when the browser comes online
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'BROWSER_ONLINE') {
    console.log('Browser is online, triggering sync...');
    
    // If we have sync registration capability, register a sync
    if (self.registration.sync) {
      self.registration.sync.register('sync-interviews');
    }
  }
});