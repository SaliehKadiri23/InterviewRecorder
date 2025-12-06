import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InterviewForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    intervieweeRole: '',
    intervieweeName: '',
    responses: {}
  });
  
  const navigate = useNavigate();
  
  const roles = [
    { id: 'student', name: 'Student', label: 'Student' },
    { id: 'classRep', name: 'Class Rep', label: 'Class Representative' },
    { id: 'lecturer', name: 'Lecturer', label: 'Lecturer' }
  ];
  
  const questionsByRole = {
    student: [
      { id: 'conflictFrequency', question: 'How often do you experience timetable conflicts?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { id: 'severityRating', question: 'Rate the severity of timetable issues', type: 'range', min: 1, max: 5 },
      { id: 'notificationMethod', question: 'How are you currently notified about schedule changes?', type: 'textarea' },
      { id: 'arrivedAtWrongVenue', question: 'How often do you arrive at a hall only to find your lecture has been moved?', type: 'select', options: ['Often', 'Sometimes', 'Rarely', 'Never'] },
      { id: 'timeWastedSearching', question: 'How much time do you spend searching for changed venues?', type: 'select', options: ['0-15min', '15-30min', '30-60min', '60+min'] }
    ],
    classRep: [
      { id: 'conflictFrequency', question: 'How often do you experience timetable conflicts?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { id: 'severityRating', question: 'Rate the severity of timetable issues', type: 'range', min: 1, max: 5 },
      { id: 'notificationMethod', question: 'How are you currently notified about schedule changes?', type: 'textarea' },
      { id: 'communicationMethod', question: 'What method do you use to communicate with students?', type: 'textarea' },
      { id: 'notificationSpeed', question: 'How quickly are students notified of changes?', type: 'select', options: ['Immediately', 'Within 1 hour', '1-3 hours', '3+ hours'] }
    ],
    lecturer: [
      { id: 'conflictFrequency', question: 'How often do you experience timetable conflicts?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { id: 'severityRating', question: 'Rate the severity of timetable issues', type: 'range', min: 1, max: 5 },
      { id: 'notificationMethod', question: 'How are you currently notified about schedule changes?', type: 'textarea' },
      { id: 'doubleBookingFrequency', question: 'How often are you double-booked?', type: 'select', options: ['Often', 'Sometimes', 'Rarely', 'Never'] },
      { id: 'notificationAdvanceTime', question: 'How much advance notice do you get for changes?', type: 'select', options: ['Same day', '1 day', '2-3 days', '1 week+'] }
    ]
  };
  
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleResponseChange = (questionId, value) => {
    setFormData({
      ...formData,
      responses: {
        ...formData.responses,
        [questionId]: value
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Interview data:', formData);
    // In a real app, this would save to IndexedDB or API
    navigate('/interviews');
  };
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Interviewee Role</h3>
            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="flex items-center">
                  <input
                    id={`role-${role.id}`}
                    name="intervieweeRole"
                    type="radio"
                    value={role.id}
                    checked={formData.intervieweeRole === role.id}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor={`role-${role.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interviewee Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="intervieweeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewee Name
                </label>
                <input
                  type="text"
                  id="intervieweeName"
                  name="intervieweeName"
                  value={formData.intervieweeName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter interviewee name"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Questions</h3>
            <div className="space-y-6">
              {formData.intervieweeRole && questionsByRole[formData.intervieweeRole]?.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.question}
                  </label>
                  {question.type === 'select' && (
                    <select
                      value={formData.responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select an option</option>
                      {question.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {question.type === 'textarea' && (
                    <textarea
                      value={formData.responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your response"
                    />
                  )}
                  {question.type === 'range' && (
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={question.min}
                        max={question.max}
                        value={formData.responses[question.id] || 0}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-full"
                      />
                      <span className="text-lg font-medium text-primary-600 min-w-[30px]">
                        {formData.responses[question.id] || 0}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Interview</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p><span className="font-medium">Interviewee:</span> {formData.intervieweeName}</p>
              <p><span className="font-medium">Role:</span> {roles.find(r => r.id === formData.intervieweeRole)?.label}</p>
              <p><span className="font-medium">Responses:</span></p>
              <ul className="ml-4 mt-2 space-y-1">
                {Object.entries(formData.responses).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">New Interview</h2>
        <div className="mt-4">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 text-xs">
            <span>Role</span>
            <span className="text-center">Info</span>
            <span className="text-center">Questions</span>
            <span className="text-right">Review</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Submit Interview
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export { InterviewForm };