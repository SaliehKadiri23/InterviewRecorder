import { Outlet } from 'react-router-dom';
import { Menu, X, BarChart3, FileText, Users, Home, Wifi, WifiOff, RotateCcw, AlertCircle, X as CloseIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import SyncStatus from '../sync/SyncStatus';
import OnlineStatusBanner from './OnlineStatusBanner';
import InstallPrompt from '../pwa/InstallPrompt';
import ErrorBoundary from '../common/ErrorBoundary';

export const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [connectionType, setConnectionType] = useState('');
  const [showSlowConnectionWarning, setShowSlowConnectionWarning] = useState(true);

  // Network status management
  useEffect(() => {
    // Initialize network status
    setIsOnline(navigator.onLine);
    
    // Get connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    // Event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Connection change listener (if supported)
    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    // Check for updates (simulated - in real app this would use service worker)
    const checkForUpdates = () => {
      // For demo purposes, we'll simulate occasional updates
      const shouldShowUpdate = Math.random() > 0.9;
      if (shouldShowUpdate) {
        setUpdateAvailable(true);
        setShowUpdateNotification(true);
      }
    };
    
    const updateTimer = setTimeout(checkForUpdates, 10000); // Check after 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearTimeout(updateTimer);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleUpdateNow = () => {
    // In real app, would trigger service worker update
    window.location.reload();
  };

  const handleUpdateLater = () => {
    setShowUpdateNotification(false);
  };

  const handleSlowConnectionClose = () => {
    setShowSlowConnectionWarning(false);
  };

  // Check if connection is slow
  const isSlowConnection = connectionType && ['slow-2g', '2g', '3g'].includes(connectionType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 flex items-center justify-between fixed top-16 right-4 z-50 rounded-lg shadow-lg">
          <div className="flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            <span>A new version is available!</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateNow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Update Now
            </button>
            <button
              onClick={handleUpdateLater}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
            >
              Later
            </button>
            <button
              onClick={() => setShowUpdateNotification(false)}
              className="text-blue-800 hover:text-blue-900"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Online/Offline Banner */}
      <OnlineStatusBanner />
      
      {/* Slow Connection Warning */}
      {isSlowConnection && showSlowConnectionWarning && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-2 flex items-center justify-between fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Slow connection detected. Features may be delayed.</span>
          </div>
          <button
            onClick={handleSlowConnectionClose}
            className="text-yellow-800 hover:text-yellow-900 ml-2"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Interview Recorder
              </h1>
              <span className="ml-3 text-xs bg-blue-500 bg-opacity-50 px-2 py-1 rounded-full">
                CSC4301
              </span>
            </div>
            
            {/* Network Status Indicator and Desktop Navigation */}
            <div className="flex items-center space-x-4">
              {/* Network Status Indicator */}
              <div className="hidden md:flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {isOnline ? 'Online' : 'Offline'} 
                  {connectionType && connectionType !== 'unknown' && ` (${connectionType})`}
                </span>
              </div>
              
              <nav className="hidden md:flex space-x-1">
                <a 
                  href="/dashboard" 
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </a>
                <a 
                  href="/interviews" 
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Interviews
                </a>
                <a 
                  href="/statistics" 
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistics
                </a>
              </nav>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-md text-white hover:bg-blue-500"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-blue-500">
              <nav className="flex flex-col space-y-2">
                <a 
                  href="/dashboard" 
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </a>
                <a 
                  href="/interviews" 
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Interviews
                </a>
                <a 
                  href="/statistics" 
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Statistics
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content with Error Boundary */}
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          {children || <Outlet />}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Interview Recorder
              </h3>
              <p className="text-gray-400 text-sm mt-1">CSC4301 Requirements Gathering Tool</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© {new Date().getFullYear()} Interview Recorder</p>
              <p className="text-gray-500 text-sm mt-1">Designed for offline-first interviews</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Sync Status Widget */}
      <SyncStatus />
    </div>
  );
};