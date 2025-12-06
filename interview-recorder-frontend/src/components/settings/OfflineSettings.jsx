import { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, Download, Upload, Trash2, AlertTriangle, Save, Settings } from 'lucide-react';
import offlineService from '../../services/offlineService';
import { getInterviews } from '../../db/database';

const OfflineSettings = () => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15min');
  const [storageSize, setStorageSize] = useState({ sizeInKB: 0, sizeInMB: 0 });
  const [interviewCount, setInterviewCount] = useState(0);
  const [conflictResolution, setConflictResolution] = useState('server-wins');
  const [isCalculatingStorage, setIsCalculatingStorage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAutoSync = localStorage.getItem('auto_sync_enabled');
    const savedInterval = localStorage.getItem('sync_interval');
    const savedConflictResolution = localStorage.getItem('conflict_resolution');
    
    if (savedAutoSync !== null) setAutoSyncEnabled(savedAutoSync === 'true');
    if (savedInterval) setSyncInterval(savedInterval);
    if (savedConflictResolution) setConflictResolution(savedConflictResolution);
    
    loadInterviewCount();
    loadStorageSize();
  }, []);

  // Load interview count
  const loadInterviewCount = async () => {
    try {
      const interviews = await getInterviews();
      setInterviewCount(interviews.length);
    } catch (error) {
      console.error('Error loading interview count:', error);
    }
  };

  // Load storage size
  const loadStorageSize = async () => {
    setIsCalculatingStorage(true);
    try {
      const size = await offlineService.getStorageSize();
      setStorageSize(size);
    } catch (error) {
      console.error('Error calculating storage size:', error);
    } finally {
      setIsCalculatingStorage(false);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('auto_sync_enabled', autoSyncEnabled.toString());
    localStorage.setItem('sync_interval', syncInterval);
    localStorage.setItem('conflict_resolution', conflictResolution);
    
    alert('Settings saved successfully!');
  };

  // Clear cached data
  const handleClearCachedData = async () => {
    if (showConfirmation) {
      try {
        // Clear all offline data older than 0 days (i.e., all data)
        const clearedCount = await offlineService.clearOldData(0);
        
        // Also clear any remaining localStorage queues
        localStorage.removeItem('sync_queue');
        
        // Reload counts
        loadInterviewCount();
        loadStorageSize();
        
        alert(`Cached data cleared successfully! Removed ${clearedCount} items.`);
      } catch (error) {
        console.error('Error clearing cached data:', error);
        alert('Error clearing cached data: ' + error.message);
      } finally {
        setShowConfirmation(false);
      }
    } else {
      setShowConfirmation(true);
    }
  };

  // Export backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      await offlineService.exportBackup();
      alert('Backup exported successfully!');
    } catch (error) {
      console.error('Error exporting backup:', error);
      alert('Error exporting backup: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file import
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Import backup
  const handleImportBackup = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setIsImporting(true);
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          const result = await offlineService.importBackup(backupData);
          
          // Reload counts after import
          loadInterviewCount();
          loadStorageSize();
          
          alert(`Backup imported successfully!\nInterviews: ${result.interviewsImported}\nQueue items: ${result.queueItemsImported}`);
        } catch (error) {
          console.error('Error parsing backup file:', error);
          alert('Error importing backup: Invalid file format');
        }
      };
      
      fileReader.onerror = () => {
        alert('Error reading file');
      };
      
      fileReader.readAsText(importFile);
    } catch (error) {
      console.error('Error importing backup:', error);
      alert('Error importing backup: ' + error.message);
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  // Format storage size for display
  const formatStorageSize = () => {
    if (storageSize.sizeInMB > 0) {
      return `${storageSize.sizeInMB} MB`;
    } else if (storageSize.sizeInKB > 0) {
      return `${storageSize.sizeInKB} KB`;
    } else {
      return `${storageSize.sizeInBytes} bytes`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Settings className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Offline Settings</h2>
      </div>
      
      <div className="space-y-6">
        {/* Auto-Sync Settings */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Sync Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-sync</label>
                <p className="text-xs text-gray-500">Automatically sync when online</p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="sr-only"
                  id="auto-sync-toggle"
                />
                <label
                  htmlFor="auto-sync-toggle"
                  className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    autoSyncEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform ${
                      autoSyncEnabled ? 'transform translate-x-6' : ''
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="manual">Manual</option>
                <option value="5min">Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
                <option value="30min">Every 30 minutes</option>
                <option value="1hour">Every hour</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Conflict Resolution */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Conflict Resolution
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conflict Resolution Strategy
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conflict-resolution"
                  value="server-wins"
                  checked={conflictResolution === 'server-wins'}
                  onChange={(e) => setConflictResolution(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Server wins (recommended)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conflict-resolution"
                  value="local-wins"
                  checked={conflictResolution === 'local-wins'}
                  onChange={(e) => setConflictResolution(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Local wins</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conflict-resolution"
                  value="merge"
                  checked={conflictResolution === 'merge'}
                  onChange={(e) => setConflictResolution(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Merge (combine both)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conflict-resolution"
                  value="ask-user"
                  checked={conflictResolution === 'ask-user'}
                  onChange={(e) => setConflictResolution(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ask user when conflict occurs</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Storage Management */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-purple-600" />
            Storage Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviewCount}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {isCalculatingStorage ? 'Calculating...' : formatStorageSize()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadStorageSize}
              disabled={isCalculatingStorage}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isCalculatingStorage ? 'animate-spin' : ''}`} />
              {isCalculatingStorage ? 'Calculating...' : 'Refresh Size'}
            </button>
            
            <button
              onClick={handleClearCachedData}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showConfirmation ? 'Confirm Clear?' : 'Clear Cached Data'}
            </button>
            
            <button
              onClick={() => offlineService.clearOldData(7)}
              className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old Data (7 days)
            </button>
          </div>
        </div>
        
        {/* Backup & Restore */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Save className="w-5 h-5 mr-2 text-green-600" />
            Backup & Restore
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Export</h4>
              <p className="text-sm text-gray-600">Create a backup of your offline data</p>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Import</h4>
              <p className="text-sm text-gray-600">Restore data from a backup file</p>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    file:hover:bg-blue-700
                    hover:file:cursor-pointer"
                />
                
                <button
                  onClick={handleImportBackup}
                  disabled={isImporting || !importFile}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save Settings */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineSettings;