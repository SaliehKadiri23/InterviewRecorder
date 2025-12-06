// Student Questions
const studentQuestions = [
  {
    id: 'conflictFrequency',
    question: 'How often do you experience timetable conflicts?',
    type: 'select',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    required: true
  },
  {
    id: 'severityRating',
    question: 'Rate the severity of timetable issues',
    type: 'range',
    min: 1,
    max: 5,
    required: true
  },
  {
    id: 'notificationMethod',
    question: 'How are you currently notified about schedule changes?',
    type: 'textarea',
    required: true
  },
  {
    id: 'arrivedAtWrongVenue',
    question: 'How often do you arrive at a hall only to find your lecture has been moved?',
    type: 'select',
    options: ['Often', 'Sometimes', 'Rarely', 'Never'],
    required: true
  },
  {
    id: 'timeWastedSearching',
    question: 'How much time do you spend searching for changed venues?',
    type: 'select',
    options: ['0-15min', '15-30min', '30-60min', '60+min'],
    required: true
  },
  {
    id: 'missedLecture',
    question: 'Have you ever missed a lecture due to timetable conflicts?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'biggestFrustration',
    question: "What's your biggest frustration with the current timetable system?",
    type: 'textarea',
    required: true
  },
  {
    id: 'preferredNotification',
    question: 'How do you prefer to receive notifications?',
    type: 'select',
    options: ['Email', 'SMS', 'App', 'WhatsApp'],
    required: true
  },
  {
    id: 'experiencedClash',
    question: 'Have you experienced two lectures scheduled at the same time?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  }
];

// Class Rep Questions
const classRepQuestions = [
  {
    id: 'conflictFrequency',
    question: 'How often do you experience timetable conflicts?',
    type: 'select',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    required: true
  },
  {
    id: 'severityRating',
    question: 'Rate the severity of timetable issues in your group',
    type: 'range',
    min: 1,
    max: 5,
    required: true
  },
  {
    id: 'notificationMethod',
    question: 'How are you currently notified about schedule changes?',
    type: 'textarea',
    required: true
  },
  {
    id: 'communicationMethod',
    question: 'What method do you use to communicate changes to students?',
    type: 'textarea',
    required: true
  },
  {
    id: 'notificationSpeed',
    question: 'How quickly are students notified of changes?',
    type: 'select',
    options: ['Immediately', 'Within 1 hour', '1-3 hours', '3+ hours'],
    required: true
  },
  {
    id: 'communicationChallenges',
    question: 'What are the main communication challenges you face?',
    type: 'textarea',
    required: true
  },
  {
    id: 'studentsMissUpdates',
    question: 'What percentage of students miss important updates?',
    type: 'select',
    options: ['0-25%', '25-50%', '50-75%', '75-100%'],
    required: true
  },
  {
    id: 'desiredFeatures',
    question: 'What features would help you communicate more effectively?',
    type: 'textarea',
    required: true
  },
  {
    id: 'maintainUnofficialSchedule',
    question: 'Do you maintain an unofficial schedule to help students?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  }
];

// Lecturer Questions
const lecturerQuestions = [
  {
    id: 'conflictFrequency',
    question: 'How often do you experience timetable conflicts?',
    type: 'select',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    required: true
  },
  {
    id: 'severityRating',
    question: 'Rate the severity of timetable issues in your department',
    type: 'range',
    min: 1,
    max: 5,
    required: true
  },
  {
    id: 'notificationMethod',
    question: 'How are you currently notified about schedule changes?',
    type: 'textarea',
    required: true
  },
  {
    id: 'doubleBookingFrequency',
    question: 'How often are you double-booked for venues?',
    type: 'select',
    options: ['Often', 'Sometimes', 'Rarely', 'Never'],
    required: true
  },
  {
    id: 'notificationAdvanceTime',
    question: 'How much advance notice do you typically get for changes?',
    type: 'select',
    options: ['Same day', '1 day', '2-3 days', '1 week+'],
    required: true
  },
  {
    id: 'conflictResolutionProcess',
    question: 'Describe the current conflict resolution process',
    type: 'textarea',
    required: true
  },
  {
    id: 'studentCommunicationMethod',
    question: 'How do students typically communicate with you about timetable issues?',
    type: 'textarea',
    required: true
  },
  {
    id: 'studentsMissPercentage',
    question: 'What percentage of students are affected by timetable issues?',
    type: 'select',
    options: ['0-25%', '25-50%', '50-75%', '75-100%'],
    required: true
  },
  {
    id: 'desiredImprovements',
    question: 'What improvements would you like to see in the timetable management system?',
    type: 'textarea',
    required: true
  }
];

// Helper function to get questions by role
const getQuestionsByRole = (role) => {
  switch (role.toLowerCase()) {
    case 'student':
      return studentQuestions;
    case 'class rep':
    case 'classrep':
      return classRepQuestions;
    case 'lecturer':
      return lecturerQuestions;
    default:
      throw new Error('Invalid role. Must be "student", "class rep", or "lecturer".');
  }
};

module.exports = {
  studentQuestions,
  classRepQuestions,
  lecturerQuestions,
  getQuestionsByRole
};