import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewById, deleteInterview } from '../../db/database';

const InterviewDetail = ({ interviewId, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const data = await getInterviewById(interviewId);
        setInterview(data);
      } catch (err) {
        setError('Failed to load interview details');
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Format response based on question type
  const formatResponse = (question, response) => {
    if (response === undefined || response === null || response === '') {
      return <span className="text-gray-500 italic">Not answered</span>;
    }

    switch (question.type) {
      case 'range':
        return (
          <span className="font-medium text-blue-600">
            {response} / 5
          </span>
        );
      case 'select':
      case 'radio':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {response}
          </span>
        );
      default:
        return <span className="text-gray-700">{response}</span>;
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        await deleteInterview(interviewId);
        onClose(); // Close modal after deletion
        // In a real app, you might want to notify parent component to refresh list
      } catch (error) {
        console.error('Error deleting interview:', error);
        alert('Failed to delete interview');
      }
    }
  };

  // Handle edit
  const handleEdit = () => {
    // Navigate to edit form - in a real implementation you'd have an edit route
    // For now, close the modal and navigate to the form
    onClose();
    // You might pass interview data to prepopulate form
    navigate('/interviews/new');
  };

  // Handle export as PDF
  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here');
    // In a real implementation, you would generate a PDF using a library like jsPDF
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Not Found</h3>
          <p className="text-gray-600 mb-4">Interview not found.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
        style={{ transform: 'scale(1) translateY(0)', opacity: 1 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {interview.intervieweeName}
              </h2>
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
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            {interview.isOwn && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(interview.responses || {}).map(([questionId, response]) => {
              // In a real app, you'd get question details from the questions config
              // For now, we'll create a generic question object based on common patterns
              let question = {
                id: questionId,
                question: questionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                type: typeof response === 'number' ? 'range' : 'text'
              };

              // Set type based on common question patterns
              if (questionId.includes('Frequency')) question.type = 'select';
              else if (questionId.includes('Rating')) question.type = 'range';
              else if (['Yes', 'No'].includes(response) || questionId.includes('Lecture') || questionId.includes('Clash')) question.type = 'radio';

              return (
                <div key={questionId} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {question.question}
                  </h3>
                  <div className="text-gray-700">
                    {formatResponse(question, response)}
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
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {interview.synced ? 'Synced' : 'Not synced'}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;