import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { 
  getInterviews, 
  getSyncQueue, 
  clearSyncQueue
} from '../../db/database';
import { syncPendingInterviews } from '../../services/syncService';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const InterviewList = () => {
  const navigate = useNavigate();
  const { isOnline, syncNow } = useOnlineStatus();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byRole: { Student: 0, 'Class Rep': 0, Lecturer: 0 },
    pendingSync: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    role: 'All',
    search: '',
    sort: 'newest',
    interviewer: 'All'
  });

  // Fetch interviews and sync queue
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      // Get current user info from auth service
      let currentUserMatric = null;
      
      try {
        // Decode JWT token to get user info
        const token = localStorage.getItem('interview_recorder_token');
        
        if (token) {
          // Simple JWT decode (in a real implementation, use a proper library)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const tokenPayload = tokenParts[1];
            const decodedPayload = JSON.parse(atob(tokenPayload));
            // The matricNumber should be in the payload
            currentUserMatric = decodedPayload.matricNumber || decodedPayload.user?.matricNumber;
          }
        }
      } catch (decodeError) {
        console.warn('Could not decode token:', decodeError);
        // Continue without current user matric
      }
      
      // Get local interviews from IndexedDB
      let localInterviews = await getInterviews();
      
      // Get online interviews from backend API
      let onlineInterviews = [];
      const token = localStorage.getItem('interview_recorder_token');
      if (token) { // Only fetch if we have a token
        try {
          // Use our axios instance which handles auth headers automatically
          const response = await axios.get('/api/interviews');
          
          if (response.data.success && Array.isArray(response.data.data)) {
            // Mark online interviews as synced
            onlineInterviews = response.data.data.map(interview => ({
              ...interview,
              synced: true, // These are from the server, so they're synced
              isOwn: currentUserMatric ? interview.interviewerMatricNumber === currentUserMatric : false
            }));
          }
        } catch (apiError) {
          console.error('Error fetching online interviews:', apiError);
          // Continue with just local data
        }
      }
      
      // Combine local and online interviews
      // For now, let's merge them, prioritizing online data for updates
      const allInterviews = [...onlineInterviews, ...localInterviews];
      
      setInterviews(allInterviews);
      
      // Get sync queue count
      const syncQueue = await getSyncQueue();
      setPendingSyncCount(syncQueue.length);
      
      // Update stats
      updateStats(allInterviews, syncQueue.length);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (interviews, pendingCount) => {
    const total = interviews.length;
    const byRole = {
      Student: interviews.filter(i => i.intervieweeRole === 'Student').length,
      'Class Rep': interviews.filter(i => i.intervieweeRole === 'Class Rep').length,
      Lecturer: interviews.filter(i => i.intervieweeRole === 'Lecturer').length
    };
    
    setStats({
      total,
      byRole,
      pendingSync: pendingCount
    });
  };

  // Apply filters
  useEffect(() => {
    let result = [...interviews];
    
    // Apply role filter
    if (filters.role !== 'All') {
      result = result.filter(i => i.intervieweeRole === filters.role);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(i => 
        i.intervieweeName.toLowerCase().includes(searchLower) ||
        i.interviewerMatricNumber.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply interviewer filter
    if (filters.interviewer === 'My Interviews') {
      result = result.filter(i => i.isOwn === true);
    }
    
    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return filters.sort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredInterviews(result);
  }, [interviews, filters]);

  // Fetch data on mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  // Handle sync
  const handleSync = async () => {
    if (!isOnline) {
      alert('You are offline. Please connect to the internet to sync.');
      return;
    }
    
    setSyncing(true);
    try {
      const result = await syncNow();
      // Refresh data after sync
      fetchInterviews();
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }
    
    try {
      // In a real implementation, you'd call a delete function from the database module
      // For now, we'll just refresh the list
      fetchInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student':
        return 'bg-blue-100 text-blue-800';
      case 'Class Rep':
        return 'bg-green-100 text-green-800';
      case 'Lecturer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Interviews</h1>
        <button
          onClick={() => navigate('/interviews/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          New Interview
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.byRole.Student}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Class Reps</h3>
          <p className="text-3xl font-bold text-green-600">{stats.byRole['Class Rep']}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Pending Sync</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingSync}</p>
        </div>
      </div>

      {/* Filters and Sync */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Class Rep">Class Rep</option>
                <option value="Lecturer">Lecturer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={filters.interviewer}
                onChange={(e) => setFilters({...filters, interviewer: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
              >
                <option value="All">All Interviews</option>
                <option value="My Interviews">My Interviews</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search interviews..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={handleSync}
              disabled={syncing || !isOnline}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
                syncing || !isOnline
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:translate-y-0.5'
              }`}
            >
              {syncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  Sync Now
                  {stats.pendingSync > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] flex items-center justify-center">
                      {stats.pendingSync}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Working offline - some data may be cached
        </div>
      )}

      {/* Interviews List */}
      {loading ? (
        <SkeletonLoader />
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {interviews.length === 0 ? 'No interviews yet' : 'No interviews match your filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {interviews.length === 0 
              ? 'Get started by creating your first interview.' 
              : 'Try adjusting your filters to see more results.'}
          </p>
          {interviews.length === 0 && (
            <button
              onClick={() => navigate('/interviews/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Interview
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <div key={interview.id || interview._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{interview.intervieweeName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(interview.intervieweeRole)}`}>
                      {interview.intervieweeRole}
                    </span>
                    {!interview.synced && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Interviewer:</span> {interview.interviewerMatricNumber}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(interview.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const interviewId = interview.id || interview._id;
                      if (interviewId) {
                        navigate(`/interviews/${interviewId}`);
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    View
                  </button>
                  {interview.isOwn && (
                    <button
                      onClick={() => handleDelete(interview.id || interview._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewList;