import { useState, useEffect } from 'react';

const useInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      // Check for various indicators of installed PWA
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true ||
          localStorage.getItem('pwa_installed') === 'true') {
        setIsInstalled(true);
      }
    };

    checkInstallStatus();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setPromptEvent(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!promptEvent) return;

    // Show the install prompt
    await promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Reset the prompt event
    setPromptEvent(null);
    setIsInstallable(false);
  };

  const dismissPrompt = () => {
    setPromptEvent(null);
    setIsInstallable(false);
    // Store that user dismissed the prompt
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    dismissPrompt
  };
};

export default useInstallPrompt;