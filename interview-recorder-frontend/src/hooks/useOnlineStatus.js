import { useState, useEffect } from 'react';
import { syncPendingInterviews } from '../services/syncService';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    // Event handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = async () => {
    if (isOnline) {
      try {
        const result = await syncPendingInterviews();
        console.log('Sync completed:', result);
        return result;
      } catch (error) {
        console.error('Sync failed:', error);
        throw error;
      }
    } else {
      throw new Error('Cannot sync while offline');
    }
  };

  return { isOnline, syncNow };
};

export default useOnlineStatus;