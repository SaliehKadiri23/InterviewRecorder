import { useState, useEffect } from 'react';
import { X, CloudUpload, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { getInterviews } from '../db/database';
import { syncPendingInterviews } from '../services/syncService';

const SyncModal = ({ isOpen, onClose }) => {
  const [syncItems, setSyncItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [syncStats, setSyncStats] = useState({ total: 0, synced: 0, failed: 0, pending: 0 });

  // Load sync items
  useEffect(() => {
    if (isOpen) {
      loadSyncItems();
    }
  }, [isOpen]);

  const loadSyncItems = async () => {
    try {
      const allInterviews = await getInterviews();
      const unsynced = allInterviews.filter(interview => !interview.synced);
      
      // Create sync items with status
      const items = unsynced.map(interview => ({
        id: interview.id,
        localId: interview.localId,
        intervieweeName: interview.intervieweeName,
        intervieweeRole: interview.intervieweeRole,
        timestamp: interview.timestamp,
        status: 'pending', // pending, syncing, success, failed
        error: null
      }));
      
      setSyncItems(items);
      
      // Update stats
      const stats = {
        total: items.length,
        synced: 0,
        failed: 0,
        pending: items.length
      };
      setSyncStats(stats);
      
      // Initialize selected items
      const newSelected = new Set(items.filter(item => item.status === 'pending').map(item => item.id));
      setSelectedItems(newSelected);
    } catch (error) {
      console.error('Error loading sync items:', error);
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === syncItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(syncItems.map(item => item.id)));
    }
  };

  const syncSelectedItems = async () => {
    const selectedSyncItems = syncItems.filter(item => selectedItems.has(item.id));
    
    if (selectedSyncItems.length === 0) return;

    // Update status to syncing in UI (we'll update the real status after sync completes)
    const updatedItems = syncItems.map(item => 
      selectedItems.has(item.id) ? { ...item, status: 'syncing' } : item
    );
    setSyncItems(updatedItems);

    // Perform the sync by calling the main sync function
    // In a real app, you'd want more granular control, but for now we'll sync all pending
    try {
      const result = await syncPendingInterviews();
      
      // Reload sync items after sync completes to reflect actual status
      if (isOpen) {
        loadSyncItems();
      }
    } catch (error) {
      console.error('Error syncing selected items:', error);
      // Reload to refresh status
      if (isOpen) {
        loadSyncItems();
      }
    }
  };

  const syncAllItems = async () => {
    try {
      const result = await syncPendingInterviews();
      
      // Reload sync items after sync completes to reflect actual status
      if (isOpen) {
        loadSyncItems();
      }
    } catch (error) {
      console.error('Error syncing all items:', error);
    }
  };

  const clearFailedItems = () => {
    const newItems = syncItems.filter(item => item.status !== 'failed');
    setSyncItems(newItems);
    
    // Update stats
    const failedCount = syncItems.filter(item => item.status === 'failed').length;
    setSyncStats(prev => ({
      total: prev.total - failedCount,
      synced: prev.synced,
      failed: 0,
      pending: prev.pending
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'syncing':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Sync Management</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{syncStats.total}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{syncStats.synced}</div>
              <div className="text-gray-600">Synced</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">{syncStats.pending}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{syncStats.failed}</div>
              <div className="text-gray-600">Failed</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto">
          {syncItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending sync items
            </div>
          ) : (
            <div className="divide-y">
              {syncItems.map((item) => (
                <div key={item.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <div className="ml-3">
                          <div className="font-medium">{item.intervieweeName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {item.intervieweeRole}
                            </span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          {item.status === 'failed' && item.error && (
                            <div className="text-sm text-red-600 mt-1">{item.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                {selectedItems.size === syncItems.length ? 'Deselect All' : 'Select All'}
              </button>
              {syncStats.failed > 0 && (
                <button
                  onClick={clearFailedItems}
                  className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                >
                  Clear Failed
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={syncSelectedItems}
                disabled={selectedItems.size === 0}
                className={`px-4 py-2 text-sm rounded ${
                  selectedItems.size === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Sync Selected
              </button>
              <button
                onClick={syncAllItems}
                disabled={syncItems.length === 0}
                className={`px-4 py-2 text-sm rounded ${
                  syncItems.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Sync All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;