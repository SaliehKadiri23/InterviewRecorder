import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import useInstallPrompt from '../../hooks/useInstallPrompt';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp, dismissPrompt } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);

  // Check if install prompt should be shown
  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const timeSinceDismissed = Date.now() - dismissedTime;
    
    // Show if installable, not installed, and not dismissed in last hour (for testing)
    const shouldShow = isInstallable && 
                      !isInstalled && 
                      timeSinceDismissed > 60 * 60 * 1000; // 1 hour instead of 24 for testing

    if (shouldShow) {
      setShowPrompt(true);
    }
  }, [isInstallable, isInstalled]);

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismissClick = () => {
    dismissPrompt();
    setShowPrompt(false);
  };

  const handleMaybeLaterClick = () => {
    // Store that user clicked "Maybe later" (different from dismissing with X)
    localStorage.setItem('pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <style>
        {`
          @keyframes slideInTop {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes slideInBottom {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .animate-slide-in-top {
            animation: slideInTop 0.3s ease-out forwards;
          }
          
          .animate-slide-in-bottom {
            animation: slideInBottom 0.3s ease-out forwards;
          }
        `}
      </style>
      
      <div 
        className={`fixed z-50 p-4 border-b shadow-lg transition-all duration-300 ${
          isMobile 
            ? 'bottom-0 left-0 right-0 bg-white border-t animate-slide-in-bottom' // Mobile: bottom
            : 'top-0 left-0 right-0 bg-white border-b animate-slide-in-top' // Desktop: top
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Install Interview Recorder</p>
              <p className="text-sm text-gray-600">For offline access and better experience</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMaybeLaterClick}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Maybe later
            </button>
            <button
              onClick={handleDismissClick}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <button
            onClick={handleInstallClick}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full justify-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Install App
          </button>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;