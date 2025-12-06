const mongoose = require('mongoose');

// Define required fields for each role
const requiredFields = {
  'Student': [
    'conflictFrequency', 'severityRating', 'notificationMethod', 
    'arrivedAtWrongVenue', 'timeWastedSearching', 'missedLecture', 
    'biggestFrustration', 'preferredNotification', 'experiencedClash'
  ],
  'Class Rep': [
    'conflictFrequency', 'severityRating', 'notificationMethod',
    'communicationMethod', 'notificationSpeed', 'communicationChallenges',
    'studentsMissUpdates', 'desiredFeatures', 'maintainUnofficialSchedule'
  ],
  'Lecturer': [
    'conflictFrequency', 'severityRating', 'notificationMethod',
    'doubleBookingFrequency', 'notificationAdvanceTime', 'conflictResolutionProcess',
    'studentCommunicationMethod', 'studentsMissPercentage', 'desiredImprovements'
  ]
};

// Define validation rules for each role
const validationRules = {
  'Student': {
    conflictFrequency: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    severityRating: { min: 1, max: 5 },
    arrivedAtWrongVenue: ['Often', 'Sometimes', 'Rarely', 'Never'],
    timeWastedSearching: ['0-15min', '15-30min', '30-60min', '60+min'],
    missedLecture: ['Yes', 'No'],
    experiencedClash: ['Yes', 'No'],
    preferredNotification: ['Email', 'SMS', 'App', 'WhatsApp']
  },
  'Class Rep': {
    conflictFrequency: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    severityRating: { min: 1, max: 5 },
    notificationSpeed: ['Immediately', 'Within 1 hour', '1-3 hours', '3+ hours'],
    studentsMissUpdates: ['0-25%', '25-50%', '50-75%', '75-100%'],
    maintainUnofficialSchedule: ['Yes', 'No']
  },
  'Lecturer': {
    conflictFrequency: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    severityRating: { min: 1, max: 5 },
    doubleBookingFrequency: ['Often', 'Sometimes', 'Rarely', 'Never'],
    notificationAdvanceTime: ['Same day', '1 day', '2-3 days', '1 week+'],
    studentsMissPercentage: ['0-25%', '25-50%', '50-75%', '75-100%']
  }
};

// Main Interview schema
const interviewSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Interviewer ID is required'],
    index: true
  },
  interviewerMatricNumber: {
    type: String,
    required: [true, 'Interviewer matric number is required'],
    uppercase: true,
    index: true
  },
  groupCode: {
    type: String,
    required: [true, 'Group code is required'],
    trim: true,
    index: true
  },
  intervieweeName: {
    type: String,
    required: [true, 'Interviewee name is required'],
    trim: true
  },
  intervieweeRole: {
    type: String,
    enum: {
      values: ['Student', 'Class Rep', 'Lecturer'],
      message: 'Interviewee role must be either Student, Class Rep, or Lecturer'
    },
    required: [true, 'Interviewee role is required'],
    index: true
  },
  responses: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Responses are required'],
    validate: {
      validator: function(responses) {
        if (!responses || !this.intervieweeRole) return true; // Skip if not set
        
        // Check if role is valid
        if (!requiredFields[this.intervieweeRole]) {
          return false;
        }
        
        // Check required fields for the role
        const fields = requiredFields[this.intervieweeRole];
        for (const field of fields) {
          if (responses[field] === undefined || responses[field] === null || responses[field] === '') {
            return false;
          }
        }
        
        // Validate specific field values
        const rules = validationRules[this.intervieweeRole];
        if (rules) {
          for (const [field, rule] of Object.entries(rules)) {
            if (responses[field] !== undefined && responses[field] !== null && responses[field] !== '') {
              if (Array.isArray(rule)) {
                // Enum validation
                if (!rule.includes(responses[field])) {
                  return false;
                }
              } else if (rule.min !== undefined && rule.max !== undefined) {
                // Number range validation
                if (typeof responses[field] !== 'number' || responses[field] < rule.min || responses[field] > rule.max) {
                  return false;
                }
              }
            }
          }
        }
        
        return true;
      },
      message: function() {
        return 'Invalid responses for the specified interviewee role';
      }
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  synced: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Create compound indexes
interviewSchema.index({ interviewerId: 1, timestamp: -1 });
interviewSchema.index({ groupCode: 1, intervieweeRole: 1 });
interviewSchema.index({ groupCode: 1, timestamp: -1 });

// Create the model
module.exports = mongoose.model('Interview', interviewSchema);