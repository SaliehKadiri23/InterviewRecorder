import { useState, useEffect } from 'react';
import { Cloud, CloudUpload, CheckCircle, AlertCircle, WifiOff, X, ChevronUp, ChevronDown } from 'lucide-react';
import useSyncStatus from '../../hooks/useSyncStatus';

const SyncStatus = () => {
  const { syncStatus, pendingCount, syncNow, syncProgress, failedItems } = useSyncStatus();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update visibility based on sync status
  useEffect(() => {
    if (syncStatus === 'syncing' || pendingCount > 0 || syncStatus === 'error') {
      setIsVisible(true);
    }
  }, [syncStatus, pendingCount]);

  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return `Syncing ${syncProgress.current} of ${syncProgress.total}...`;
      case 'error':
        return `Sync failed (${failedItems.length} failed)`;
      case 'offline':
        return `Offline - ${pendingCount} pending`;
      case 'idle':
      default:
        return pendingCount > 0 ? `${pendingCount} pending` : 'All synced ✓';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <CloudUpload className="w-4 h-4 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'idle':
      default:
        return pendingCount > 0 ? <Cloud className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (syncStatus === 'error' || pendingCount > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSyncClick = () => {
    syncNow();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-lg border transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-64'
      }`}>
        {/* Main status bar */}
        <div 
          className={`flex items-center justify-between p-3 cursor-pointer ${
            syncStatus === 'error' ? 'bg-red-50' : 
            syncStatus === 'offline' ? 'bg-yellow-50' : 
            syncStatus === 'syncing' ? 'bg-blue-50' : 
            'bg-green-50'
          }`}
          onClick={handleClick}
        >
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium">
              {getStatusMessage()}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress bar for syncing state */}
        {syncStatus === 'syncing' && (
          <div className="px-3 pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: syncProgress.total > 0 
                    ? `${(syncProgress.current / syncProgress.total) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="p-3 border-t bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium">{pendingCount}</span>
              </div>
              
              {failedItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Failed:</span>
                  <span className="font-medium">{failedItems.length}</span>
                </div>
              )}

              {(syncStatus === 'error' || pendingCount > 0) && (
                <button
                  onClick={handleSyncClick}
                  disabled={syncStatus === 'syncing'}
                  className={`w-full mt-2 py-2 px-3 rounded text-sm font-medium ${
                    syncStatus === 'syncing'
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SyncStatus;