import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Filter, Download, Calendar, User, TrendingUp, Users } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { exportToPDF, generateSummaryReport } from '../utils/exportUtils';
import { authService } from '../services/authService';
import { getInterviews } from '../db/database';
import axios from '../utils/axios';
import useOnlineStatus from '../hooks/useOnlineStatus';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistics = () => {
  const { isOnline } = useOnlineStatus();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Filter state
  const [dateRange, setDateRange] = useState('30');
  const [roleFilter, setRoleFilter] = useState('all');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [interviewers, setInterviewers] = useState([]);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const userData = await authService.getCurrentUser();
        setUser(userData.user);

        let fetchedInterviews = [];
        
        if (isOnline) {
          // Try to get data from the server
          try {
            const response = await axios.get('/api/interviews');
            if (response.data.success) {
              fetchedInterviews = response.data.data;
            }
          } catch (error) {
            console.error('Failed to fetch interviews from server, falling back to local:', error);
            // Fall back to local data
            fetchedInterviews = await getInterviews();
          }
        } else {
          // Use local data when offline
          fetchedInterviews = await getInterviews();
        }
        
        setInterviews(fetchedInterviews);
        
        // Get unique interviewers for filter dropdown
        const uniqueInterviewers = [...new Map(
          fetchedInterviews.map(item => [item.interviewerMatricNumber, { 
            matricNumber: item.interviewerMatricNumber, 
            fullName: item.interviewerId?.fullName || item.interviewerMatricNumber 
          }])
        ).values()];
        setInterviewers(uniqueInterviewers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOnline]);

  // Apply filters
  useEffect(() => {
    let result = [...interviews];
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      result = result.filter(interview => new Date(interview.timestamp) >= cutoffDate);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(interview => interview.intervieweeRole === roleFilter);
    }
    
    // Apply interviewer filter
    if (interviewerFilter !== 'all') {
      if (interviewerFilter === 'my') {
        result = result.filter(interview => interview.interviewerMatricNumber === user?.matricNumber);
      } else {
        result = result.filter(interview => interview.interviewerMatricNumber === interviewerFilter);
      }
    }
    
    setFilteredInterviews(result);
  }, [interviews, dateRange, roleFilter, interviewerFilter, user]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalInterviews = filteredInterviews.length;
    const uniqueInterviewees = new Set(filteredInterviews.map(interview => interview.intervieweeName)).size;
    
    // Calculate average interviews per day
    let avgPerDay = 0;
    if (filteredInterviews.length > 0) {
      const dates = filteredInterviews.map(interview => new Date(interview.timestamp));
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24) || 1;
        avgPerDay = filteredInterviews.length / Math.max(daysDiff, 1);
      }
    }
    
    // Find most active interviewer
    const interviewerCounts = {};
    filteredInterviews.forEach(interview => {
      interviewerCounts[interview.interviewerMatricNumber] = 
        (interviewerCounts[interview.interviewerMatricNumber] || 0) + 1;
    });
    
    let mostActiveInterviewer = '';
    let maxCount = 0;
    Object.entries(interviewerCounts).forEach(([interviewer, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveInterviewer = interviewer;
      }
    });

    return {
      totalInterviews,
      uniqueInterviewees,
      avgPerDay: avgPerDay.toFixed(2),
      mostActiveInterviewer: mostActiveInterviewer || 'N/A'
    };
  }, [filteredInterviews]);

  // Role distribution data
  const roleDistribution = useMemo(() => {
    const roleCounts = {};
    filteredInterviews.forEach(interview => {
      roleCounts[interview.intervieweeRole] = (roleCounts[interview.intervieweeRole] || 0) + 1;
    });
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count
    }));
  }, [filteredInterviews]);

  // Timeline data
  const timelineData = useMemo(() => {
    if (filteredInterviews.length === 0) return [];
    
    // Group interviews by date
    const dateCounts = {};
    filteredInterviews.forEach(interview => {
      const date = format(new Date(interview.timestamp), 'yyyy-MM-dd');
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    // Create an array of dates with counts
    const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
    return sortedDates.map(date => ({
      date,
      interviews: dateCounts[date]
    }));
  }, [filteredInterviews]);

  // Interviewer performance data
  const interviewerPerformance = useMemo(() => {
    const interviewerCounts = {};
    filteredInterviews.forEach(interview => {
      interviewerCounts[interview.interviewerMatricNumber] = 
        (interviewerCounts[interview.interviewerMatricNumber] || 0) + 1;
    });
    
    return Object.entries(interviewerCounts)
      .map(([interviewer, count]) => ({
        interviewer,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredInterviews]);

  // Response analysis by role
  const responseAnalysis = useMemo(() => {
    const analysis = {
      Student: {},
      'Class Rep': {},
      Lecturer: {}
    };
    
    // Student analysis
    const studentInterviews = filteredInterviews.filter(interview => interview.intervieweeRole === 'Student');
    if (studentInterviews.length > 0) {
      // Conflict frequency
      const conflictFreq = {};
      studentInterviews.forEach(interview => {
        const freq = interview.responses?.conflictFrequency;
        if (freq) conflictFreq[freq] = (conflictFreq[freq] || 0) + 1;
      });
      analysis.Student.conflictFrequency = Object.entries(conflictFreq).map(([freq, count]) => ({ name: freq, value: count }));
      
      // Average severity rating
      const severitySum = studentInterviews.reduce((sum, interview) => sum + (interview.responses?.severityRating || 0), 0);
      analysis.Student.avgSeverity = studentInterviews.length > 0 ? (severitySum / studentInterviews.length).toFixed(2) : 0;
      
      // Common frustrations
      const frustrations = {};
      studentInterviews.forEach(interview => {
        const frustration = interview.responses?.biggestFrustration;
        if (frustration && frustration.trim()) {
          const words = frustration.toLowerCase().match(/\b(\w{4,})\b/g) || []; // Get words with 4+ chars
          words.forEach(word => {
            frustrations[word] = (frustrations[word] || 0) + 1;
          });
        }
      });
      analysis.Student.frustrations = Object.entries(frustrations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
      
      // Preferred notification methods
      const notificationMethods = {};
      studentInterviews.forEach(interview => {
        const method = interview.responses?.preferredNotification;
        if (method) notificationMethods[method] = (notificationMethods[method] || 0) + 1;
      });
      analysis.Student.notificationMethods = Object.entries(notificationMethods).map(([method, count]) => ({ name: method, value: count }));
    }
    
    // Class Rep analysis
    const classRepInterviews = filteredInterviews.filter(interview => interview.intervieweeRole === 'Class Rep');
    if (classRepInterviews.length > 0) {
      // Communication methods
      const commMethods = {};
      classRepInterviews.forEach(interview => {
        const method = interview.responses?.communicationMethod;
        if (method) commMethods[method] = (commMethods[method] || 0) + 1;
      });
      analysis['Class Rep'].communicationMethods = Object.entries(commMethods).map(([method, count]) => ({ name: method, value: count }));
      
      // Student miss rate averages
      const missRates = classRepInterviews.map(interview => interview.responses?.studentsMissUpdates).filter(Boolean);
      analysis['Class Rep'].avgMissRate = missRates.length > 0 ? missRates[0] : 'N/A'; // Simplified - in real app you'd parse percentages
      
      // Notification speed distribution
      const notificationSpeed = {};
      classRepInterviews.forEach(interview => {
        const speed = interview.responses?.notificationSpeed;
        if (speed) notificationSpeed[speed] = (notificationSpeed[speed] || 0) + 1;
      });
      analysis['Class Rep'].notificationSpeed = Object.entries(notificationSpeed).map(([speed, count]) => ({ name: speed, value: count }));
    }
    
    // Lecturer analysis
    const lecturerInterviews = filteredInterviews.filter(interview => interview.intervieweeRole === 'Lecturer');
    if (lecturerInterviews.length > 0) {
      // Double booking frequency
      const doubleBookingFreq = {};
      lecturerInterviews.forEach(interview => {
        const freq = interview.responses?.doubleBookingFrequency;
        if (freq) doubleBookingFreq[freq] = (doubleBookingFreq[freq] || 0) + 1;
      });
      analysis.Lecturer.doubleBookingFreq = Object.entries(doubleBookingFreq).map(([freq, count]) => ({ name: freq, value: count }));
      
      // Average notification advance time
      const advanceTimes = lecturerInterviews.map(interview => interview.responses?.notificationAdvanceTime).filter(Boolean);
      analysis.Lecturer.avgAdvanceTime = advanceTimes.length > 0 ? advanceTimes[0] : 'N/A'; // Simplified
      
      // Student miss percentage averages
      const missPercentages = lecturerInterviews.map(interview => interview.responses?.studentsMissPercentage).filter(Boolean);
      analysis.Lecturer.avgMissPercentage = missPercentages.length > 0 ? missPercentages[0] : 'N/A'; // Simplified
    }
    
    return analysis;
  }, [filteredInterviews]);

  // Generate insights
  const insights = useMemo(() => {
    const insightsList = [];
    
    if (filteredInterviews.length > 0) {
      // Common issues
      const studentInterviews = filteredInterviews.filter(interview => interview.intervieweeRole === 'Student');
      if (studentInterviews.length > 0) {
        const severitySum = studentInterviews.reduce((sum, interview) => sum + (interview.responses?.severityRating || 0), 0);
        const avgSeverity = studentInterviews.length > 0 ? severitySum / studentInterviews.length : 0;
        
        if (avgSeverity >= 4) {
          insightsList.push(`High average severity rating (${avgSeverity.toFixed(1)}) indicates significant issues`);
        }
      }
      
      // Add other insights based on data patterns
      if (roleDistribution.length > 0) {
        const maxRole = roleDistribution.reduce((prev, current) => (prev.value > current.value) ? prev : current);
        insightsList.push(`Most interviews are from ${maxRole.name}s (${maxRole.value} interviews)`);
      }
    }
    
    return insightsList;
  }, [filteredInterviews, roleDistribution]);

  // Export handlers
  const handleExportPDF = () => {
    // Export the actual interview data for PDF generation
    exportToPDF(filteredInterviews);
  };

  const handleExportRawData = () => {
    const summary = generateSummaryReport(filteredInterviews);
    const summaryBlob = new Blob([summary], { type: 'text/plain' });
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `interview_summary_${dateStr}.txt`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(summaryBlob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Interview Statistics</h1>
          <p className="text-gray-600">Analysis of group interviews</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleExportRawData}
            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Raw Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Class Rep">Class Rep</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Interviewers</option>
              <option value="my">My Interviews</option>
              {interviewers.map((interviewer) => (
                <option key={interviewer.matricNumber} value={interviewer.matricNumber}>
                  {interviewer.fullName} ({interviewer.matricNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Interviewees</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.uniqueInterviewees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg per Day</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.avgPerDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Most Active</p>
              <p className="text-lg font-bold text-gray-900 truncate max-w-[120px]">{statistics.mostActiveInterviewer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
          {roleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interviews Over Time</h3>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={timelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="interviews" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interviewer Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interviewer Performance</h3>
          {interviewerPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={interviewerPerformance}
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="interviewer" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No insights available based on current data</p>
          )}
        </div>
      </div>

      {/* Response Analysis by Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Analysis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Analysis</h3>
          {responseAnalysis.Student && Object.keys(responseAnalysis.Student).length > 0 ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Conflict Frequency</h4>
                {responseAnalysis.Student.conflictFrequency && responseAnalysis.Student.conflictFrequency.length > 0 ? (
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={responseAnalysis.Student.conflictFrequency}>
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm">No data</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Avg Severity Rating</h4>
                <p className="text-lg font-semibold">{responseAnalysis.Student.avgSeverity || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Common Frustrations</h4>
                {responseAnalysis.Student.frustrations && responseAnalysis.Student.frustrations.length > 0 ? (
                  <ul className="text-sm text-gray-600">
                    {responseAnalysis.Student.frustrations.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item.word} ({item.count})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No data</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No student data available</p>
          )}
        </div>

        {/* Class Rep Analysis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Rep Analysis</h3>
          {responseAnalysis['Class Rep'] && Object.keys(responseAnalysis['Class Rep']).length > 0 ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Methods</h4>
                {responseAnalysis['Class Rep'].communicationMethods && responseAnalysis['Class Rep'].communicationMethods.length > 0 ? (
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={responseAnalysis['Class Rep'].communicationMethods}>
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm">No data</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Avg Miss Rate</h4>
                <p className="text-lg font-semibold">{responseAnalysis['Class Rep'].avgMissRate || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No class rep data available</p>
          )}
        </div>

        {/* Lecturer Analysis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lecturer Analysis</h3>
          {responseAnalysis.Lecturer && Object.keys(responseAnalysis.Lecturer).length > 0 ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Double Booking Frequency</h4>
                {responseAnalysis.Lecturer.doubleBookingFreq && responseAnalysis.Lecturer.doubleBookingFreq.length > 0 ? (
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={responseAnalysis.Lecturer.doubleBookingFreq}>
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm">No data</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Avg Advance Time</h4>
                <p className="text-lg font-semibold">{responseAnalysis.Lecturer.avgAdvanceTime || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No lecturer data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;