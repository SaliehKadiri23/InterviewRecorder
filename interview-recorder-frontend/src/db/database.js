import Dexie from 'dexie';

// Create Dexie database
const db = new Dexie('InterviewRecorderDB');

// Define schema
db.version(1).stores({
  interviews: '++id, intervieweeName, intervieweeRole, responses, timestamp, synced, localId',
  syncQueue: '++id, action, data, timestamp, retries'
});

// Database methods
const addInterview = async (interviewData) => {
  try {
    const id = await db.interviews.add({
      ...interviewData,
      synced: false,
      timestamp: interviewData.timestamp || new Date().toISOString(),
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unique local ID
    });
    return id;
  } catch (error) {
    throw new Error(`Failed to add interview: ${error.message}`);
  }
};

const getInterviews = async (filters = {}) => {
  try {
    let collection = db.interviews;

    // Apply filters
    if (filters.role) {
      collection = collection.where('intervieweeRole').equals(filters.role);
    }
    if (filters.synced !== undefined) {
      collection = collection.where('synced').equals(filters.synced);
    }

    // Get all items and then sort them
    let interviews = await collection.toArray();
    
    // Sort by timestamp (newest first)
    interviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return interviews;
  } catch (error) {
    throw new Error(`Failed to get interviews: ${error.message}`);
  }
};

const getInterviewById = async (id) => {
  try {
    const interview = await db.interviews.get(id);
    return interview;
  } catch (error) {
    throw new Error(`Failed to get interview: ${error.message}`);
  }
};

const updateInterview = async (id, data) => {
  try {
    const updatedCount = await db.interviews.update(id, {
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    });
    return updatedCount > 0;
  } catch (error) {
    throw new Error(`Failed to update interview: ${error.message}`);
  }
};

const deleteInterview = async (id) => {
  try {
    await db.interviews.delete(id);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete interview: ${error.message}`);
  }
};

const addToSyncQueue = async (action, data) => {
  try {
    const id = await db.syncQueue.add({
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    return id;
  } catch (error) {
    throw new Error(`Failed to add to sync queue: ${error.message}`);
  }
};

const getSyncQueue = async () => {
  try {
    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    return queue;
  } catch (error) {
    throw new Error(`Failed to get sync queue: ${error.message}`);
  }
};

const clearSyncQueue = async (ids = null) => {
  try {
    if (ids && ids.length > 0) {
      // Delete specific items from queue
      await db.syncQueue.bulkDelete(ids);
    } else {
      // Clear entire queue
      await db.syncQueue.clear();
    }
    return true;
  } catch (error) {
    throw new Error(`Failed to clear sync queue: ${error.message}`);
  }
};

const markAsSynced = async (localId) => {
  try {
    const updatedCount = await db.interviews.update(
      { localId }, 
      { synced: true }
    );
    return updatedCount > 0;
  } catch (error) {
    throw new Error(`Failed to mark as synced: ${error.message}`);
  }
};

// Export database instance and methods
export default db;
export {
  addInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  markAsSynced
};