import { Outlet } from 'react-router-dom';
import SyncStatus from '../sync/SyncStatus';
import OnlineStatusBanner from './OnlineStatusBanner';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Online/Offline Banner */}
      <OnlineStatusBanner />
      
      {/* Header */}
      <header className="bg-primary-600 text-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl text-black font-bold">Interview Recorder</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
              <li><a href="/interviews" className="hover:underline">Interviews</a></li>
              <li><a href="/statistics" className="hover:underline">Statistics</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Interview Recorder - CSC4301 Requirements Gathering Tool</p>
        </div>
      </footer>
      
      {/* Sync Status Widget */}
      <SyncStatus />
    </div>
  );
};