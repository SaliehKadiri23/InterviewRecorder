import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviews } from '../../db/database';
import { syncPendingInterviews } from '../../services/syncService';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import axios from '../../utils/axios';
import FilterPanel from '../../components/interviews/FilterPanel';
import { authService } from '../../services/authService';
import { FileText, Plus, Cloud, Clock, User, Calendar, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const InterviewList = () => {
  const navigate = useNavigate();
  const { isOnline, syncNow } = useOnlineStatus();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [interviewers, setInterviewers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    roles: [],
    interviewer: '',
    dateFrom: '',
    dateTo: '',
    syncStatus: 'all',
    sort: 'newest'
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current user and initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const userData = await authService.getCurrentUser();
        setUser(userData.user);

        // Get interviews based on online status
        if (isOnline) {
          try {
            const response = await axios.get('/api/interviews');
            if (response.data.success) {
              setInterviews(response.data.data);
              
              // Get unique interviewers for filter dropdown
              const uniqueInterviewers = [...new Map(
                response.data.data.map(item => [item.interviewerMatricNumber, { 
                  matricNumber: item.interviewerMatricNumber, 
                  fullName: item.interviewerId?.fullName || item.interviewerMatricNumber 
                }])
              ).values()];
              setInterviewers(uniqueInterviewers);
            }
          } catch (error) {
            console.error('Failed to fetch interviews from server:', error);
          }
        } else {
          // Get local interviews
          const localInterviews = await getInterviews();
          setInterviews(localInterviews);
          
          // Get unique interviewers from local data
          const uniqueInterviewers = [...new Map(
            localInterviews.map(item => [item.interviewerMatricNumber, { 
              matricNumber: item.interviewerMatricNumber, 
              fullName: item.interviewerMatricNumber 
            }])
          ).values()];
          setInterviewers(uniqueInterviewers);
        }

        // Get pending sync count
        const localInterviews = await getInterviews();
        const unsynced = localInterviews.filter(interview => !interview.synced);
        setPendingSync(unsynced.length);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOnline]);

  // Apply filters - using useCallback to prevent infinite re-renders
  const applyFilters = useCallback((interviewList, currentFilters, currentUser) => {
    let result = [...(interviewList || [])];

    // Apply search filter
    if (currentFilters.search) {
      result = result.filter(
        interview => 
          interview.intervieweeName.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
          interview.interviewerMatricNumber.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    // Apply role filters
    if (currentFilters.roles.length > 0) {
      result = result.filter(interview => currentFilters.roles.includes(interview.intervieweeRole));
    }

    // Apply interviewer filter
    if (currentFilters.interviewer === 'my' && currentUser) {
      result = result.filter(interview => interview.interviewerMatricNumber === currentUser.matricNumber);
    } else if (currentFilters.interviewer && currentFilters.interviewer !== 'my') {
      result = result.filter(interview => interview.interviewerMatricNumber === currentFilters.interviewer);
    }

    // Apply date range filter
    if (currentFilters.dateFrom) {
      result = result.filter(interview => new Date(interview.timestamp) >= new Date(currentFilters.dateFrom));
    }
    if (currentFilters.dateTo) {
      result = result.filter(interview => new Date(interview.timestamp) <= new Date(currentFilters.dateTo));
    }

    // Apply sync status filter
    if (currentFilters.syncStatus === 'pending' && !isOnline) {
      result = result.filter(interview => !interview.synced);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (currentFilters.sort) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'name-asc':
          return a.intervieweeName.localeCompare(b.intervieweeName);
        case 'name-desc':
          return b.intervieweeName.localeCompare(a.intervieweeName);
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return result;
  }, [isOnline]);

  // Apply filters whenever interviews or filters change
  useEffect(() => {
    const result = applyFilters(interviews, filters, user);
    setFilteredInterviews(result);
  }, [interviews, filters, user, applyFilters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSync = async () => {
    try {
      await syncNow();
      // Refresh pending sync count
      const localInterviews = await getInterviews();
      const unsynced = localInterviews.filter(interview => !interview.synced);
      setPendingSync(unsynced.length);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleInterviewClick = (interview) => {
    navigate(`/interviews/${interview._id || interview.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Interviews</h1>
          <p className="text-gray-600">{filteredInterviews.length} interviews found</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/interviews/new')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </button>
          
          {pendingSync > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline}
              className={`flex items-center ${
                isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              } text-white font-medium py-2 px-4 rounded-lg transition-colors`}
            >
              <Cloud className="w-4 h-4 mr-2" />
              Sync Now ({pendingSync})
            </button>
          )}
        </div>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
        {/* Filter Panel */}
        <div className={isMobile ? '' : 'lg:col-span-1'}>
          <FilterPanel
            allInterviewers={interviewers}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            isMobile={isMobile}
          />
        </div>

        {/* Interview List */}
        <div className={isMobile ? '' : 'lg:col-span-3'}>
          {filteredInterviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-500 mb-4">
                {interviews.length === 0 
                  ? "You haven't created any interviews yet."
                  : "No interviews match your current filters."
                }
              </p>
              <button
                onClick={() => navigate('/interviews/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Create Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id || interview.id}
                  onClick={() => handleInterviewClick(interview)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{interview.intervieweeName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {interview.intervieweeRole}
                        </span>
                        {!interview.synced && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        <span>{interview.interviewerMatricNumber}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(interview.timestamp).toLocaleDateString()} •{' '}
                          {formatDistanceToNow(new Date(interview.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInterviewClick(interview);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewList;