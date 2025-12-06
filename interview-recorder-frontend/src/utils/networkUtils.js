/**
 * Network utility functions
 */

// Get current network status
export const getNetworkStatus = () => {
  return navigator.onLine;
};

// Get connection speed/quality
export const getConnectionSpeed = () => {
  // Using the Network Information API if available
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  // Fallback to basic detection
  return {
    effectiveType: 'unknown',
    downlink: null,
    rtt: null,
    saveData: false
  };
};

// Check if connection is slow
export const isSlowConnection = () => {
  const connection = navigator.connection;
  
  if (connection) {
    // Types considered slow: 'slow-2g', '2g', '3g'
    const slowTypes = ['slow-2g', '2g', '3g'];
    return slowTypes.includes(connection.effectiveType);
  }
  
  // Fallback: check if we have limited bandwidth indicators
  return false;
};

// Wait for online status
export const waitForOnline = () => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

// Wait for offline status
export const waitForOffline = () => {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve();
      return;
    }

    const handleOffline = () => {
      window.removeEventListener('offline', handleOffline);
      resolve();
    };

    window.addEventListener('offline', handleOffline);
  });
};

// Throttle function for reducing network requests
export const throttle = (func, delay) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};

// Debounce function for network calls
export const debounce = (func, delay) => {
  let timeoutId;
  return function() {
    const args = arguments;
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
};

// Check if the browser supports background sync
export const supportsBackgroundSync = () => {
  return 'serviceWorker' in navigator && 'sync' in navigator.serviceWorker;
};

// Check if the browser supports background fetch
export const supportsBackgroundFetch = () => {
  return 'serviceWorker' in navigator && 'backgroundFetch' in navigator.serviceWorker;
};

// Get estimated connection speed
export const getEstimatedSpeed = () => {
  if (!('connection' in navigator)) {
    return 'unknown';
  }

  const connection = navigator.connection;
  
  switch (connection.effectiveType) {
    case 'slow-2g':
      return 'slow';
    case '2g':
      return 'slow';
    case '3g':
      return 'medium';
    case '4g':
      return 'fast';
    default:
      return 'fast';
  }
};

// Measure network quality based on RTT and Downlink
export const measureNetworkQuality = () => {
  if (!('connection' in navigator)) {
    return 'unknown';
  }

  const connection = navigator.connection;
  
  if (connection.rtt !== undefined && connection.downlink !== undefined) {
    const rtt = connection.rtt; // Round-trip time in milliseconds
    const downlink = connection.downlink; // Effective bandwidth in Mbps
    
    if (rtt < 50 && downlink > 2) return 'excellent';
    if (rtt < 100 && downlink > 1) return 'good';
    if (rtt < 200 && downlink > 0.5) return 'moderate';
    if (rtt < 800 && downlink > 0.1) return 'poor';
    return 'very-poor';
  }
  
  return 'unknown';
};

// Function to generate skeleton class names (for use in JSX components)
export const getSkeletonClassNames = (className = "") => {
  return `animate-pulse bg-gray-200 rounded ${className}`;
};

// Progressive loading utility (not including JSX)
export const progressiveLoad = (componentPromise, fallback, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(componentPromise);
    }, delay);
  });
};

// Show cached content while loading new data
export const showCachedThenUpdate = async (getCachedData, getFreshData, setData) => {
  // First, show cached data if available
  try {
    const cachedData = await getCachedData();
    if (cachedData) {
      setData({ data: cachedData, loading: true, source: 'cached' });
    }
  } catch (error) {
    console.log('No cached data available');
  }
  
  // Then fetch fresh data
  try {
    const freshData = await getFreshData();
    setData({ data: freshData, loading: false, source: 'fresh' });
  } catch (error) {
    console.error('Error fetching fresh data:', error);
    setData(prev => ({ ...prev, loading: false })); // Stop loading even if error
  }
};