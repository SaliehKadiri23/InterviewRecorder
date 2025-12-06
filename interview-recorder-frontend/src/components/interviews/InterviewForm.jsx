import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { getQuestionsByRole } from '../../utils/interviewQuestions';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { 
  addInterview, 
  addToSyncQueue,
  getInterviews 
} from '../../db/database';
import { authService } from '../../services/authService';
import axios from '../../utils/axios';

// Define schema for validation
const createSchema = () => z.object({
  intervieweeRole: z.string().min(1, 'Please select an interviewee role'),
  intervieweeName: z.string().min(1, 'Interviewee name is required').max(100),
  // Dynamic responses will be validated separately based on role
});

const InterviewForm = () => {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: {
      intervieweeRole: '',
      intervieweeName: '',
      responses: {}
    }
  });

  // Watch specific fields for dynamic behavior
  const watchRole = watch('intervieweeRole');
  const watchResponses = watch('responses') || {};

  // Update questions when role changes
  useEffect(() => {
    if (watchRole) {
      const roleQuestions = getQuestionsByRole(watchRole);
      setQuestions(roleQuestions);
    } else {
      setQuestions([]);
    }
  }, [watchRole]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (currentStep === 3) { // Only auto-save when on questions step
      const timeout = setTimeout(async () => {
        try {
          await saveDraft();
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 30000); // 30 seconds

      setAutoSaveTimeout(timeout);

      return () => clearTimeout(timeout);
    }
  }, [currentStep, watchRole, watchResponses]);

  // Save draft to IndexedDB
  const saveDraft = async () => {
    const formData = {
      intervieweeRole: watchRole,
      intervieweeName: watch('intervieweeName'),
      responses: watchResponses,
      timestamp: new Date().toISOString()
    };

    try {
      await addInterview({
        ...formData,
        synced: false,
        draft: true
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  // Handle response change
  const handleResponseChange = (questionId, value) => {
    const newResponses = {
      ...watchResponses,
      [questionId]: value
    };
    setValue('responses', newResponses);
    
    // Trigger validation for responses
    if (currentStep === 3) {
      trigger();
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!watchRole) {
        setError('Please select an interviewee role');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2
      const intervieweeName = watch('intervieweeName');
      if (!intervieweeName || intervieweeName.trim() === '') {
        setError('Interviewee name is required');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setError('');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate all responses
      const allRequiredAnswered = questions.every(q => {
        if (q.required) {
          const value = watchResponses[q.id];
          return value !== undefined && value !== null && value !== '';
        }
        return true;
      });

      if (allRequiredAnswered) {
        setError('');
        setCurrentStep(4);
      } else {
        setError('Please answer all required questions');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const interviewData = {
        intervieweeRole: data.intervieweeRole,
        intervieweeName: data.intervieweeName,
        responses: data.responses,
        timestamp: new Date().toISOString()
      };

      if (isOnline) {
        // If online, try to save to server first
        try {
          const response = await axios.post('/api/interviews', interviewData);
          if (response.data.success) {
            setShowSuccess(true);
            // Dispatch interview completion event
            window.dispatchEvent(new CustomEvent('interviewCompleted'));
            setTimeout(() => {
              navigate('/interviews');
            }, 1500);
          }
        } catch (serverError) {
          // If server save fails, save locally and queue for sync
          const localId = await addInterview(interviewData);
          await addToSyncQueue('create', { ...interviewData, localId });
          setShowSuccess(true);
          // Dispatch interview completion event
          window.dispatchEvent(new CustomEvent('interviewCompleted'));
          setTimeout(() => {
            navigate('/interviews');
          }, 1500);
        }
      } else {
        // If offline, save locally and queue for sync
        const localId = await addInterview(interviewData);
        await addToSyncQueue('create', { ...interviewData, localId });
        setShowSuccess(true);
        // Dispatch interview completion event
        window.dispatchEvent(new CustomEvent('interviewCompleted'));
        setTimeout(() => {
          navigate('/interviews');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save interview');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const value = watchResponses[question.id] || '';
    
    switch (question.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.responses?.[question.id] ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select an option</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="mt-2 space-y-2">
            {question.options.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  id={`${question.id}-${option}`}
                  name={question.id}
                  type="radio"
                  checked={value === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`${question.id}-${option}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.responses?.[question.id] ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Enter your response"
          />
        );
      
      case 'range':
        return (
          <div className="mt-1">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              value={value || 0}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-center mt-1 font-medium text-blue-600">
              {value || 0}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const getProgress = () => {
    switch (currentStep) {
      case 1: return 25;
      case 2: return 50;
      case 3: return 75;
      case 4: return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">Interview saved successfully.</span>
        </div>
      )}

      {/* Offline badge */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-400 text-yellow-700 px-4 py-2 text-center">
          Working offline - data will sync when connection is restored
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mb-8 px-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {step}
            </div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              {step === 1 && 'Role'}
              {step === 2 && 'Name'}
              {step === 3 && 'Questions'}
              {step === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Step 1: Select Role */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Select Interviewee Role</h2>
            <div className="space-y-4">
              {['Student', 'Class Rep', 'Lecturer'].map((role) => (
                <div
                  key={role}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    watchRole === role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => setValue('intervieweeRole', role)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      watchRole === role ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                    }`}>
                      {watchRole === role && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="font-medium">{role}</span>
                  </div>
                </div>
              ))}
            </div>
            {errors.intervieweeRole && (
              <p className="mt-2 text-sm text-red-600">{errors.intervieweeRole.message}</p>
            )}
          </div>
        )}

        {/* Step 2: Enter Name */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Interviewee Information</h2>
            <div className="mb-4">
              <label htmlFor="intervieweeName" className="block text-sm font-medium text-gray-700 mb-1">
                Interviewee Name
              </label>
              <input
                type="text"
                id="intervieweeName"
                {...register('intervieweeName')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.intervieweeName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter interviewee's name"
              />
              {errors.intervieweeName && (
                <p className="mt-1 text-sm text-red-600">{errors.intervieweeName.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Questions */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Interview Questions</h2>
            <p className="text-gray-600 mb-6">For: <span className="font-semibold">{watchRole}</span></p>
            
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderQuestion(question)}
                  {errors.responses?.[question.id] && (
                    <p className="mt-1 text-sm text-red-600">
                      {question.question} is required
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Review Interview</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Interviewee Role</p>
                  <p className="font-medium">{watchRole}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interviewee Name</p>
                  <p className="font-medium">{watch('intervieweeName')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="text-sm font-medium text-gray-700">{question.question}</p>
                  <p className="mt-1">
                    {(() => {
                      const value = watchResponses[question.id];
                      if (value === undefined || value === null || value === '') {
                        return <span className="text-gray-500 italic">Not answered</span>;
                      }
                      
                      if (question.type === 'range') {
                        return `${value}/5`;
                      }
                      
                      return value;
                    })()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isOnline ? 'Saving...' : 'Saving Locally...'}
                </>
              ) : (
                <>{isOnline ? 'Submit Interview' : 'Save Locally'}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;