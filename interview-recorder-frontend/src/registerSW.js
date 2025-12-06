// registerSW.js
export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Check for updates periodically (every 1 hour)
      setInterval(async () => {
        await registration.update();
      }, 60 * 60 * 1000); // 1 hour

      // Listen for update events
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            showUpdateNotification();
          }
        });
      });

      // Handle messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          console.log('Background sync completed');
        } else if (event.data && event.data.type === 'SYNC_ERROR') {
          console.error('Background sync error:', event.data.error);
        }
      });

      // Check if the user is already controlling the page
      if (navigator.serviceWorker.controller) {
        console.log('Service worker already active');
      } else {
        console.log('Service worker registered but not yet active');
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Worker is not supported in this browser');
  }
};

const showUpdateNotification = () => {
  // Show a simple notification that an update is available
  if (confirm('A new version of the app is available. Update now?')) {
    // Skip waiting and immediately update
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  } else {
    // Show a subtle notification without interrupting the user
    console.log('App update available. Refresh to update.');
    
    // You could also show a less intrusive UI element here
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #3b82f6;
      color: white;
      padding: 1rem;
      text-align: center;
      z-index: 10000;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    updateBanner.innerHTML = `
      <span>A new version is available!</span>
      <button id="pwa-update-btn" style="
        background: white;
        color: #3b82f6;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: bold;
      ">Update Now</button>
    `;
    
    document.body.appendChild(updateBanner);
    
    document.getElementById('pwa-update-btn').addEventListener('click', () => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    });
  }
};