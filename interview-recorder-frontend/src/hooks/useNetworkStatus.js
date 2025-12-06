import { useState, useEffect } from 'react';
import { getNetworkStatus, getConnectionSpeed, isSlowConnection } from '../utils/networkUtils';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('unknown');
  const [downlink, setDownlink] = useState(null);
  const [rtt, setRtt] = useState(null);
  const [isSlowConnectionState, setIsSlowConnectionState] = useState(false);

  useEffect(() => {
    // Initialize network status
    setIsOnline(navigator.onLine);
    const networkInfo = getConnectionSpeed();
    setConnectionType(networkInfo.effectiveType);
    setEffectiveType(networkInfo.effectiveType);
    setDownlink(networkInfo.downlink);
    setRtt(networkInfo.rtt);
    setIsSlowConnectionState(isSlowConnection());

    // Event listener for online status
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Event listener for offline status
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Event listener for connection changes (if supported)
    const handleConnectionChange = () => {
      const networkInfo = getConnectionSpeed();
      setConnectionType(networkInfo.effectiveType);
      setEffectiveType(networkInfo.effectiveType);
      setDownlink(networkInfo.downlink);
      setRtt(networkInfo.rtt);
      setIsSlowConnectionState(isSlowConnection());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Use 'connectionchange' event if supported
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // Return the network status information
  return {
    isOnline,
    connectionType: connectionType,
    isSlowConnection: isSlowConnectionState,
    effectiveType: effectiveType,
    downlink,
    rtt,
    // Add a method to refresh network info
    refreshNetworkInfo: () => {
      const networkInfo = getConnectionSpeed();
      setConnectionType(networkInfo.effectiveType);
      setEffectiveType(networkInfo.effectiveType);
      setDownlink(networkInfo.downlink);
      setRtt(networkInfo.rtt);
      setIsSlowConnectionState(isSlowConnection());
    }
  };
};

export default useNetworkStatus;