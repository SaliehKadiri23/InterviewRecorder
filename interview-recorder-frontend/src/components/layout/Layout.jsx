import { Outlet } from 'react-router-dom';
import { Menu, X, BarChart3, FileText, Users, Home } from 'lucide-react';
import { useState } from 'react';
import SyncStatus from '../sync/SyncStatus';
import OnlineStatusBanner from './OnlineStatusBanner';
import InstallPrompt from '../pwa/InstallPrompt';

export const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* Online/Offline Banner */}
      <OnlineStatusBanner />
      
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
            
            {/* Desktop Navigation */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children || <Outlet />}
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