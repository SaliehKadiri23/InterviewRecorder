import { addInterview, getInterviews, updateInterview, deleteInterview, addToSyncQueue, getSyncQueue, clearSyncQueue } from '../db/database';

// Offline Service for data persistence and conflict resolution
class OfflineService {
  constructor() {
    this.storageKey = 'interview_recorder';
  }

  // Data persistence methods
  async saveInterviewOffline(interviewData) {
    try {
      // Generate a unique local ID for offline interviews
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const interviewToSave = {
        ...interviewData,
        localId,
        synced: false,
        createdAt: interviewData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const id = await addInterview(interviewToSave);
      return { id, localId };
    } catch (error) {
      console.error('Error saving interview offline:', error);
      throw new Error(`Failed to save interview offline: ${error.message}`);
    }
  }

  async getOfflineInterviews() {
    try {
      // Since our getInterviews function has a filters parameter, we need to handle it properly
      const allInterviews = await getInterviews();
      return allInterviews.filter(interview => !interview.synced);
    } catch (error) {
      console.error('Error getting offline interviews:', error);
      throw new Error(`Failed to get offline interviews: ${error.message}`);
    }
  }

  async deleteOfflineInterview(localId) {
    try {
      // Find the interview by localId
      const allInterviews = await getInterviews();
      const interview = allInterviews.find(i => i.localId === localId);
      
      if (!interview) {
        throw new Error(`Interview with localId ${localId} not found`);
      }

      await deleteInterview(interview.id);
      return true;
    } catch (error) {
      console.error('Error deleting offline interview:', error);
      throw new Error(`Failed to delete interview: ${error.message}`);
    }
  }

  async updateOfflineInterview(localId, data) {
    try {
      // Find the interview by localId
      const allInterviews = await getInterviews();
      const interview = allInterviews.find(i => i.localId === localId);
      
      if (!interview) {
        throw new Error(`Interview with localId ${localId} not found`);
      }

      const updatedData = {
        ...interview,
        ...data,
        updatedAt: new Date().toISOString(),
        synced: false // Mark as unsynced after update
      };

      await updateInterview(interview.id, updatedData);
      return true;
    } catch (error) {
      console.error('Error updating offline interview:', error);
      throw new Error(`Failed to update interview: ${error.message}`);
    }
  }

  // Conflict resolution methods
  detectConflict(localData, serverData) {
    // Check for conflicts based on timestamps or content changes
    const localTimestamp = new Date(localData.updatedAt || localData.createdAt).getTime();
    const serverTimestamp = new Date(serverData.updatedAt || serverData.createdAt).getTime();
    
    // If local data is newer, there might be a conflict
    if (localTimestamp > serverTimestamp) {
      // Check if actual content differs
      return this.isContentDifferent(localData, serverData);
    }
    
    return false;
  }

  isContentDifferent(localData, serverData) {
    // Compare key fields to determine if content is different
    const fields = ['intervieweeName', 'intervieweeRole', 'responses'];
    
    for (const field of fields) {
      if (JSON.stringify(localData[field]) !== JSON.stringify(serverData[field])) {
        return true;
      }
    }
    
    return false;
  }

  resolveConflict(strategy, local, server) {
    switch (strategy) {
      case 'use-local':
        return { resolved: local, strategy: 'use-local' };
      case 'use-server':
        return { resolved: server, strategy: 'use-server' };
      case 'merge':
        return this.mergeData(local, server);
      default:
        // Default to server wins but notify user
        return { resolved: server, strategy: 'server-default' };
    }
  }

  mergeData(local, server) {
    // Create a merged object prioritizing newer content
    const merged = { ...server };
    
    // Merge responses by taking the most recent value for each key
    if (local.responses && server.responses) {
      const localTime = new Date(local.updatedAt || local.createdAt).getTime();
      const serverTime = new Date(server.updatedAt || server.createdAt).getTime();
      
      merged.responses = { ...server.responses };
      
      Object.keys(local.responses).forEach(key => {
        // If local data is newer for this specific field, use it
        if (localTime > serverTime) {
          merged.responses[key] = local.responses[key];
        }
      });
    }
    
    // Update the merged record with newer metadata
    merged.updatedAt = new Date().toISOString();
    merged.conflictResolved = true;
    
    return { resolved: merged, strategy: 'merged' };
  }

  // Sync queue management
  async addToQueue(action, data) {
    try {
      // Use the database function for sync queue management
      return await addToSyncQueue(action, data);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw new Error(`Failed to add to sync queue: ${error.message}`);
    }
  }

  async processQueue() {
    try {
      // Get sync queue from database
      const queue = await getSyncQueue();
      const results = [];
      
      for (const item of queue) {
        try {
          let result;
          
          switch (item.action) {
            case 'create':
              result = await this.processCreate(item);
              break;
            case 'update':
              result = await this.processUpdate(item);
              break;
            case 'delete':
              result = await this.processDelete(item);
              break;
            default:
              throw new Error(`Unknown action: ${item.action}`);
          }
          
          // Remove successful items from queue
          await this.removeFromQueue(item.id);
          results.push({ id: item.id, success: true, result });
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          
          // Increment retry count
          await this.incrementRetryCount(item.id);
          
          results.push({ 
            id: item.id, 
            success: false, 
            error: error.message,
            retries: item.retries + 1
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing sync queue:', error);
      throw new Error(`Failed to process sync queue: ${error.message}`);
    }
  }

  async processCreate(item) {
    // Implementation would depend on your API integration
    // This is a placeholder that would call your API
    console.log('Processing create:', item);
    return { success: true, data: item.data };
  }

  async processUpdate(item) {
    // Implementation would depend on your API integration
    console.log('Processing update:', item);
    return { success: true, data: item.data };
  }

  async processDelete(item) {
    // Implementation would depend on your API integration
    console.log('Processing delete:', item);
    return { success: true };
  }

  async getSyncQueue() {
    try {
      return await getSyncQueue();
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async removeFromQueue(id) {
    try {
      // Remove from database sync queue
      const queue = await this.getSyncQueue();
      const itemToRemove = queue.find(item => item.id == id);
      if (itemToRemove) {
        await clearSyncQueue([itemToRemove.id]);
      }
      return true;
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      throw new Error(`Failed to remove from sync queue: ${error.message}`);
    }
  }

  async incrementRetryCount(id) {
    try {
      // In our database setup, syncQueue has a retries field
      // We'll need to get the queue item and update its retry count
      // However, our existing database functions don't support updating individual sync queue items
      // For now, we'll note this in the localStorage backup
      console.warn("Incrementing retry count not fully implemented in database");
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  }

  async retryQueue() {
    try {
      const queue = await this.getSyncQueue();
      const failedItems = queue.filter(item => item.status === 'failed' || item.retries > 0);
      
      // Process the queue again
      return await this.processQueue();
    } catch (error) {
      console.error('Error retrying sync queue:', error);
      throw new Error(`Failed to retry sync queue: ${error.message}`);
    }
  }

  // Data validation methods
  validateInterview(data) {
    const errors = [];
    
    if (!data.intervieweeName || typeof data.intervieweeName !== 'string' || data.intervieweeName.trim() === '') {
      errors.push('intervieweeName is required and must be a non-empty string');
    }
    
    if (!data.intervieweeRole || !['Student', 'Class Rep', 'Lecturer'].includes(data.intervieweeRole)) {
      errors.push('intervieweeRole is required and must be one of: Student, Class Rep, Lecturer');
    }
    
    if (!data.responses || typeof data.responses !== 'object') {
      errors.push('responses is required and must be an object');
    }
    
    if (!data.timestamp || isNaN(Date.parse(data.timestamp))) {
      errors.push('timestamp is required and must be a valid date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  sanitizeData(data) {
    if (!data) return null;
    
    const sanitized = { ...data };
    
    // Sanitize strings
    if (sanitized.intervieweeName) {
      sanitized.intervieweeName = sanitized.intervieweeName.trim().substring(0, 100);
    }
    
    // Sanitize responses
    if (sanitized.responses && typeof sanitized.responses === 'object') {
      // Remove any potentially dangerous or malformed data
      Object.keys(sanitized.responses).forEach(key => {
        if (typeof sanitized.responses[key] === 'string') {
          sanitized.responses[key] = sanitized.responses[key].substring(0, 5000); // Limit response length
        }
      });
    }
    
    return sanitized;
  }

  async checkDataIntegrity() {
    try {
      const allInterviews = await getInterviews();
      const issues = [];
      
      for (const interview of allInterviews) {
        // Check for missing required fields
        if (!interview.id) {
          issues.push({ id: interview.localId || 'unknown', issue: 'Missing ID' });
        }
        
        if (!interview.intervieweeName) {
          issues.push({ id: interview.id, issue: 'Missing interviewee name' });
        }
        
        if (!interview.intervieweeRole) {
          issues.push({ id: interview.id, issue: 'Missing interviewee role' });
        }
        
        if (!interview.responses) {
          issues.push({ id: interview.id, issue: 'Missing responses' });
        }
        
        // Check timestamp validity
        if (!interview.timestamp || isNaN(Date.parse(interview.timestamp))) {
          issues.push({ id: interview.id, issue: 'Invalid timestamp' });
        }
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        totalInterviews: allInterviews.length,
        healthyInterviews: allInterviews.length - issues.length
      };
    } catch (error) {
      console.error('Error checking data integrity:', error);
      throw new Error(`Failed to check data integrity: ${error.message}`);
    }
  }

  // Storage management methods
  async getStorageSize() {
    try {
      // Approximate storage size by checking localStorage and IndexedDB size
      let size = 0;
      
      // Check localStorage size
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length * 2; // Approximate bytes per character
        }
      }
      
      // For IndexedDB, we'll calculate based on the data we know about
      const allInterviews = await getInterviews();
      const interviewDataString = JSON.stringify(allInterviews);
      size += interviewDataString.length * 2; // Approximate bytes per character
      
      return {
        sizeInBytes: size,
        sizeInKB: Math.round(size / 1024),
        sizeInMB: Math.round(size / (1024 * 1024))
      };
    } catch (error) {
      console.error('Error getting storage size:', error);
      throw new Error(`Failed to get storage size: ${error.message}`);
    }
  }

  async clearOldData(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const allInterviews = await getInterviews();
      let clearedCount = 0;
      
      for (const interview of allInterviews) {
        if (interview.synced && new Date(interview.timestamp) < cutoffDate) {
          await deleteInterview(interview.id);
          clearedCount++;
        }
      }
      
      return clearedCount;
    } catch (error) {
      console.error('Error clearing old data:', error);
      throw new Error(`Failed to clear old data: ${error.message}`);
    }
  }

  async exportBackup() {
    try {
      const allInterviews = await getInterviews();
      const syncQueue = await this.getSyncQueue();
      
      const backup = {
        interviews: allInterviews,
        syncQueue,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      const dataStr = JSON.stringify(backup);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `interview-recorder-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw new Error(`Failed to export backup: ${error.message}`);
    }
  }

  async importBackup(backupJson) {
    try {
      const backup = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      
      if (!backup.interviews || !backup.syncQueue) {
        throw new Error('Invalid backup format');
      }
      
      // Import interviews
      for (const interview of backup.interviews) {
        // Ensure each interview is properly saved to IndexedDB
        await addInterview({
          ...interview,
          id: undefined // Let IndexedDB generate a new ID to avoid conflicts
        });
      }
      
      // Import sync queue - add each item to the database sync queue
      for (const item of backup.syncQueue) {
        await addToSyncQueue(item.action, item.data);
      }
      
      return {
        interviewsImported: backup.interviews.length,
        queueItemsImported: backup.syncQueue.length
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      throw new Error(`Failed to import backup: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const offlineService = new OfflineService();
export default offlineService;