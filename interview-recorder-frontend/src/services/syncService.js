import { getSyncQueue, clearSyncQueue, markAsSynced, getInterviews, updateInterview, deleteInterview } from '../db/database';
import axios from '../utils/axios';

// Global variable to track sync status
let isSyncInProgress = false;

// Sync all pending interviews
const syncPendingInterviews = async () => {
  if (isSyncInProgress) {
    console.log('Sync already in progress, skipping');
    return { success: false, syncedCount: 0, errors: [], message: 'Sync in progress' };
  }

  try {
    isSyncInProgress = true;
    
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      console.log('No pending sync items');
      return { success: true, syncedCount: 0, errors: [] };
    }

    let syncedCount = 0;
    const errors = [];

    for (const item of queue) {
      try {
        let result;
        
        if (item.action === 'create') {
          result = await syncSingleInterview(item.data);
        } else if (item.action === 'update') {
          // For updates, we might need to handle them differently
          // For now, let's assume updates are handled similarly
          result = await syncSingleInterview(item.data);
        } else if (item.action === 'delete') {
          // Handle delete sync
          result = await syncDeleteInterview(item.data.id || item.data.localId);
        }

        if (result.success) {
          // Remove from sync queue and mark as synced if it was a create
          if (item.action === 'create' && item.data.localId) {
            await markAsSynced(item.data.localId);
          }
          syncedCount++;
        }
      } catch (error) {
        console.error(`Sync failed for item ${item.id}:`, error);
        errors.push({ item, error: error.message });
      }
    }

    // Clear synced items from queue
    await clearSyncQueue();

    return { success: true, syncedCount, errors };
  } catch (error) {
    console.error('Error syncing pending interviews:', error);
    return { success: false, syncedCount: 0, errors: [{ error: error.message }], message: 'Sync failed' };
  } finally {
    isSyncInProgress = false;
  }
};

// Sync a single interview
const syncSingleInterview = async (interview) => {
  try {
    // Remove the temporary local ID from the data to be sent to the server
    const { localId, synced, ...interviewData } = interview;
    
    let response;
    if (interview.localId) {
      // This is a new interview that was created offline, so create it
      response = await axios.post('/api/interviews', interviewData);
    } else {
      // This is an existing interview that was updated, so update it
      const interviewId = interview.id || interview._id;
      if (!interviewId) {
        throw new Error('Interview ID is required for update');
      }
      response = await axios.put(`/api/interviews/${interviewId}`, interviewData);
    }

    if (response.data.success) {
      // If there was a localId, this means it was created offline and now has a server ID
      if (localId) {
        // Update the local record with the server ID
        await updateInterview(interview.id, { 
          ...response.data.data,
          synced: true
        });
      }
      
      handleSyncSuccess(localId, response.data.data._id);
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.error || 'Server returned failure');
    }
  } catch (error) {
    console.error('Error syncing single interview:', error);
    handleSyncFailure(interview.localId || interview.id || interview._id, error);
    throw error;
  }
};

// Sync a delete operation
const syncDeleteInterview = async (interviewId) => {
  try {
    const response = await axios.delete(`/api/interviews/${interviewId || 'unknown'}`);

    if (response.data.success) {
      // Delete the local record
      if (interviewId) {
        await deleteInterview(interviewId);
      }
      return { success: true };
    } else {
      throw new Error(response.data.error || 'Server returned failure for delete');
    }
  } catch (error) {
    console.error('Error syncing delete:', error);
    throw error;
  }
};

// Handle sync success
const handleSyncSuccess = async (localId, serverId) => {
  try {
    if (localId) {
      // Update the local record to mark as synced and update with server ID if needed
      await markAsSynced(localId);
      console.log(`Successfully synced interview: ${localId}`);
    }
  } catch (error) {
    console.error('Error handling sync success:', error);
  }
};

// Handle sync failure
const handleSyncFailure = async (localId, error) => {
  console.error(`Sync failed for interview ${localId}:`, error);
  // In a more sophisticated implementation, you might:
  // - Increment retry count
  // - Add back to sync queue with backoff
  // - Show user notification
};

// Register background sync when online
const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    try {
      // Register a sync event named 'sync-interviews'
      await navigator.serviceWorker.ready;
      await navigator.serviceWorker.controller?.sync?.register('sync-interviews');
      console.log('Background sync registered for interviews');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  } else {
    console.log('Background Sync is not supported in this browser');
    // Fallback: try manual sync when online
    if (navigator.onLine) {
      await syncPendingInterviews();
    }
  }
};

// Listen for sync requests from service worker
const setupSyncListener = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC_REQUEST') {
        // Service worker is requesting a sync
        syncPendingInterviews();
      }
    });
  }
};

// Initialize sync functionality
const initializeSync = () => {
  setupSyncListener();
  
  // Listen for online/offline events
  window.addEventListener('online', async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Notify the service worker that we're online
      navigator.serviceWorker.controller.postMessage({ type: 'BROWSER_ONLINE' });
    } else {
      // Fallback: sync now if service worker is not available
      await syncPendingInterviews();
    }
  });
};

export {
  syncPendingInterviews,
  syncSingleInterview,
  handleSyncSuccess,
  handleSyncFailure,
  registerBackgroundSync,
  initializeSync
};