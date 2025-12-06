import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getInterviews } from '../../db/database';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import axios from '../../utils/axios';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  FileText, 
  Cloud, 
  Clock, 
  User, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isOnline, syncNow } = useOnlineStatus();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    myInterviews: 0,
    pendingSync: 0,
    lastSync: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [interviewerLeaderboard, setInterviewerLeaderboard] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error('Failed to get user info:', error);
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics
        let totalInterviews = 0;
        let myInterviews = 0;
        let pendingSync = 0;
        let recentActivityData = [];
        let roleDistributionData = [];
        let interviewerLeaderboardData = [];
        
        // Get local interviews to calculate pending sync
        const allLocalInterviews = await getInterviews();
        const localUnsynced = allLocalInterviews.filter(interview => !interview.synced);
        pendingSync = localUnsynced.length;
        
        // Get statistics from server if online
        if (isOnline) {
          try {
            // Fetch group interviews
            const interviewsResponse = await axios.get('/api/interviews');
            if (interviewsResponse.data.success) {
              totalInterviews = interviewsResponse.data.total || interviewsResponse.data.data?.length || 0;
              
              // Get recent activity (last 5 interviews)  
              const allInterviews = interviewsResponse.data.data || [];
              const sortedInterviews = [...allInterviews].sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
              );
              recentActivityData = sortedInterviews.slice(0, 5);
            }
            
            // Fetch my interviews
            const myInterviewsResponse = await axios.get('/api/interviews/my');
            if (myInterviewsResponse.data.success) {
              myInterviews = myInterviewsResponse.data.total || myInterviewsResponse.data.data?.length || 0;
            }
            
            // Fetch stats for role distribution
            const statsResponse = await axios.get('/api/interviews/stats');
            if (statsResponse.data.success) {
              // Update role distribution
              roleDistributionData = statsResponse.data.data.roleBreakdown;
              // Update leaderboard
              interviewerLeaderboardData = statsResponse.data.data.interviewerBreakdown.slice(0, 5);
            }
          } catch (error) {
            console.error('Failed to fetch server data:', error);
          }
        } else {
          // When offline, use local data
          const allInterviews = allLocalInterviews;
          totalInterviews = allInterviews.length;
          
          // Get user's interviews if we have user info
          if (user) {
            const userInterviews = allInterviews.filter(interview => 
              interview.interviewerMatricNumber === user.matricNumber
            );
            myInterviews = userInterviews.length;
          }
          
          // Get recent activity - get last 5 interviews
          const allInterviewsSorted = [...allInterviews].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          recentActivityData = allInterviewsSorted.slice(0, 5);
          
          // Calculate role distribution locally
          const roleCounts = {};
          allInterviews.forEach(interview => {
            roleCounts[interview.intervieweeRole] = (roleCounts[interview.intervieweeRole] || 0) + 1;
          });
          
          roleDistributionData = Object.entries(roleCounts).map(([role, count]) => ({
            role,
            count
          }));
          
          // Calculate interviewer leaderboard locally
          const interviewerCounts = {};
          allInterviews.forEach(interview => {
            interviewerCounts[interview.interviewerMatricNumber] = 
              (interviewerCounts[interview.interviewerMatricNumber] || 0) + 1;
          });
          
          interviewerLeaderboardData = Object.entries(interviewerCounts)
            .map(([matricNumber, count]) => ({
              matricNumber,
              count,
              fullName: matricNumber // In a real implementation, we would fetch user names
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
        
        setStats({
          totalInterviews,
          myInterviews,
          pendingSync,
          lastSync: new Date()
        });
        
        setRecentActivity(recentActivityData);
        setRoleDistribution(roleDistributionData);
        setInterviewerLeaderboard(interviewerLeaderboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isOnline]);

  const handleSync = async () => {
    try {
      await syncNow();
      // Refresh dashboard data after sync
      const localInterviews = await getInterviews({ synced: false });
      setStats(prev => ({
        ...prev,
        pendingSync: localInterviews.length
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.fullName || 'Interviewer'}!
            </h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className="bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm font-medium">
                GROUP {user?.groupCode?.replace('GROUP', '') || 'N/A'}
              </span>
              {!isOnline && (
                <span className="bg-yellow-500 bg-opacity-80 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Offline
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Interviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.myInterviews}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Sync</p>
              <p className={`text-3xl font-bold ${stats.pendingSync > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                {stats.pendingSync}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.pendingSync > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Cloud className={`h-6 w-6 ${stats.pendingSync > 0 ? 'text-yellow-600' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.lastSync ? formatDistanceToNow(stats.lastSync, { addSuffix: true }) : 'Never'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/interviews/new')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            New Interview
          </button>
          <button
            onClick={() => navigate('/interviews')}
            className="flex items-center bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            View All Interviews
          </button>
          {stats.pendingSync > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline}
              className={`flex items-center ${
                isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              } text-white font-medium py-3 px-6 rounded-lg transition-colors`}
            >
              <Cloud className="w-5 h-5 mr-2" />
              Sync Now ({stats.pendingSync} pending)
            </button>
          )}
        </div>
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Role Distribution
          </h3>
          {roleDistribution.length > 0 ? (
            <div className="space-y-4">
              {roleDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.role}</span>
                    <span className="text-gray-600">{item.count} ({calculatePercentage(item.count, stats.totalInterviews)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculatePercentage(item.count, stats.totalInterviews)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Interviewer Leaderboard */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Top Interviewers
          </h3>
          {interviewerLeaderboard.length > 0 ? (
            <div className="space-y-3">
              {interviewerLeaderboard.map((interviewer, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user?.matricNumber === interviewer.matricNumber || user?.matricNumber === interviewer._id
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{interviewer.fullName || interviewer.matricNumber}</p>
                      <p className="text-sm text-gray-500">{interviewer.matricNumber || interviewer._id}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-700">{interviewer.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          <button 
            onClick={() => navigate('/interviews')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((interview, index) => (
              <div key={interview._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{interview.intervieweeName}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="px-2 py-1 bg-gray-200 rounded text-xs mr-2">
                      {interview.intervieweeRole}
                    </span>
                    <span>by {interview.interviewerMatricNumber || (interview.interviewerId?.matricNumber)}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(interview.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>

      {/* Sync Status Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sync Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {stats.pendingSync === 0 ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>All synced ✓</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="w-5 h-5 mr-2 animate-pulse" />
                <span>{stats.pendingSync} interviews pending sync</span>
              </div>
            )}
            {isOnline && stats.lastSync && (
              <span className="text-sm text-gray-500 ml-4">
                Last sync: {formatDistanceToNow(stats.lastSync, { addSuffix: true })}
              </span>
            )}
          </div>
          {stats.pendingSync > 0 && isOnline && (
            <button
              onClick={handleSync}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };