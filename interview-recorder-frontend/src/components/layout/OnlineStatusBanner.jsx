import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

const OnlineStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessage("You're back online! Syncing pending interviews...");
      setShowBanner(true);
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setMessage("You're offline. Interviews will be saved locally.");
      setShowBanner(true);
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setMessage("You're offline. Interviews will be saved locally.");
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      <div className="flex items-center">
        {isOnline ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <WifiOff className="w-5 h-5 mr-2" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default OnlineStatusBanner;