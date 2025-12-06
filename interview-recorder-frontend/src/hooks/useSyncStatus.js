import { useState, useEffect } from 'react';
import { getInterviews } from '../db/database';
import { syncPendingInterviews } from '../services/syncService';
import useOnlineStatus from './useOnlineStatus';

const useSyncStatus = () => {
  const { isOnline } = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error, offline
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [failedItems, setFailedItems] = useState([]);

  // Load pending count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const allInterviews = await getInterviews();
        const pending = allInterviews.filter(interview => !interview.synced);
        setPendingCount(pending.length);
        
        if (pending.length === 0) {
          setSyncStatus('idle');
        } else {
          setSyncStatus(isOnline ? 'idle' : 'offline');
        }
      } catch (error) {
        console.error('Error loading pending count:', error);
      }
    };

    loadPendingCount();
  }, [isOnline]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      // Auto-sync when online and have pending items
      setSyncStatus('syncing');
    }
  }, [isOnline, pendingCount]);

  // Function to sync now
  const syncNow = async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return { success: false, message: 'Cannot sync while offline' };
    }

    setSyncStatus('syncing');
    setSyncProgress({ current: 0, total: pendingCount });

    try {
      const result = await syncPendingInterviews();
      
      // Update pending count after sync
      const allInterviews = await getInterviews();
      const newPending = allInterviews.filter(interview => !interview.synced);
      setPendingCount(newPending.length);
      
      if (result.success) {
        setSyncStatus(newPending.length === 0 ? 'idle' : 'idle');
        setSyncProgress({ current: result.syncedCount, total: result.syncedCount });
        return result;
      } else {
        setSyncStatus('error');
        setFailedItems(result.errors || []);
        return result;
      }
    } catch (error) {
      setSyncStatus('error');
      setFailedItems([{ error: error.message }]);
      return { success: false, error: error.message };
    }
  };

  // Retry failed items
  const retryFailed = async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return { success: false, message: 'Cannot sync while offline' };
    }

    setSyncStatus('syncing');
    try {
      const result = await syncPendingInterviews();
      
      // Update pending count after sync
      const allInterviews = await getInterviews();
      const newPending = allInterviews.filter(interview => !interview.synced);
      setPendingCount(newPending.length);
      
      if (result.success) {
        setSyncStatus(newPending.length === 0 ? 'idle' : 'idle');
        setFailedItems([]);
        return result;
      } else {
        setSyncStatus('error');
        setFailedItems(result.errors || []);
        return result;
      }
    } catch (error) {
      setSyncStatus('error');
      setFailedItems([{ error: error.message }]);
      return { success: false, error: error.message };
    }
  };

  return {
    syncStatus,
    pendingCount,
    syncNow,
    syncProgress,
    failedItems,
    retryFailed
  };
};

export default useSyncStatus;