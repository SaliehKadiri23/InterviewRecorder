import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { getInterviewById as getLocalInterview } from '../../db/database';
import { deleteInterview as deleteLocalInterview } from '../../db/database';

const InterviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        
        // First try to get from backend (MongoDB) if it exists
        try {
          const token = localStorage.getItem('interview_recorder_token');
          if (token) {
            const response = await axios.get(`/api/interviews/${id}`);
            if (response.data.success && response.data.data) {
              setInterview({
                ...response.data.data,
                fromBackend: true
              });
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, trying local DB:', apiError.message);
          // Continue to try local DB if API fails
        }
        
        // If backend fetch fails, try local IndexedDB
        const localData = await getLocalInterview(id);
        if (localData) {
          setInterview({
            ...localData,
            fromLocal: true
          });
        } else {
          setError('Interview not found');
        }
      } catch (err) {
        setError('Failed to load interview details');
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInterview();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        if (interview.fromBackend) {
          // Delete from backend if it exists there
          await axios.delete(`/api/interviews/${id}`);
        }
        
        // Also delete from local IndexedDB if it exists there
        await deleteLocalInterview(id);
        
        navigate('/interviews'); // Go back to the list after deletion
      } catch (error) {
        console.error('Error deleting interview:', error);
        alert('Failed to delete interview');
      }
    }
  };

  const handleBack = () => {
    navigate('/interviews');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Not Found</h3>
          <p className="text-gray-600 mb-4">Interview not found.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  // Format response based on question type
  const formatResponse = (response) => {
    if (response === undefined || response === null || response === '') {
      return <span className="text-gray-500 italic">Not answered</span>;
    }

    // For now, assuming these are basic responses
    // In a real implementation, you'd want to know the question type
    if (typeof response === 'number') {
      return (
        <span className="font-medium text-blue-600">
          {response} / 5
        </span>
      );
    } else if (typeof response === 'string' && ['Yes', 'No'].includes(response)) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          response === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {response}
        </span>
      );
    } else if (typeof response === 'object' && response !== null) {
      // For complex objects, stringify them
      return <span className="text-gray-700">{JSON.stringify(response)}</span>;
    } else {
      return <span className="text-gray-700">{response}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Interviews
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {interview.intervieweeName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  interview.intervieweeRole === 'Student' 
                    ? 'bg-blue-100 text-blue-800' 
                    : interview.intervieweeRole === 'Class Rep'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {interview.intervieweeRole}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(interview.timestamp).toLocaleDateString()} • {new Date(interview.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm text-gray-500">
                  Interviewer: {interview.interviewerMatricNumber}
                </span>
                {!interview.synced && (
                  <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                    Pending Sync
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(interview.responses || {}).map(([questionId, response]) => {
              // Format the question ID to be more readable
              const readableQuestion = questionId
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
                
              return (
                <div key={questionId} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {readableQuestion}
                  </h3>
                  <div className="text-gray-700">
                    {formatResponse(response)}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(interview.responses || {}).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No responses recorded for this interview.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {interview.synced ? 'Synced' : 'Not synced'}
            </span>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailPage;