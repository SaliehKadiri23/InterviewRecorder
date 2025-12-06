const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { 
  createInterview, 
  getGroupInterviews, 
  getMyInterviews, 
  getInterview, 
  updateInterview, 
  deleteInterview, 
  getStats 
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

// Validation middleware for interview creation
const validateCreateInterview = [
  body('intervieweeName')
    .notEmpty()
    .withMessage('Interviewee name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Interviewee name must not exceed 100 characters'),
  
  body('intervieweeRole')
    .notEmpty()
    .withMessage('Interviewee role is required')
    .isIn(['Student', 'Class Rep', 'Lecturer'])
    .withMessage('Interviewee role must be Student, Class Rep, or Lecturer'),
  
  body('responses')
    .notEmpty()
    .withMessage('Responses are required')
    .isObject()
    .withMessage('Responses must be an object'),
];

// Validation middleware for interview update
const validateUpdateInterview = [
  body('intervieweeName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Interviewee name must not exceed 100 characters'),
  
  body('intervieweeRole')
    .optional()
    .isIn(['Student', 'Class Rep', 'Lecturer'])
    .withMessage('Interviewee role must be Student, Class Rep, or Lecturer'),
  
  body('responses')
    .optional()
    .isObject()
    .withMessage('Responses must be an object'),
];

// Validation middleware for ID parameter
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid interview ID')
];

// Validation middleware for role query parameter
const validateRoleQuery = [
  query('role')
    .optional()
    .isIn(['Student', 'Class Rep', 'Lecturer'])
    .withMessage('Role must be Student, Class Rep, or Lecturer'),
];

// Validation middleware for pagination parameters
const validatePaginationParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
];

// Apply protect middleware to all routes (authentication)
router.use(protect);

// POST /api/interviews - Create new interview
router.post('/', validateCreateInterview, handleValidationErrors, createInterview);

// GET /api/interviews - Get all interviews for user's group
router.get('/', 
  validateRoleQuery, 
  validatePaginationParams, 
  handleValidationErrors, 
  getGroupInterviews
);

// GET /api/interviews/my - Get interviews by current user
router.get('/my', 
  validateRoleQuery, 
  validatePaginationParams, 
  handleValidationErrors, 
  getMyInterviews
);

// GET /api/interviews/stats - Get interview statistics
router.get('/stats', getStats);

// GET /api/interviews/:id - Get single interview
router.get('/:id', validateIdParam, handleValidationErrors, getInterview);

// PUT /api/interviews/:id - Update interview
router.put('/:id', validateIdParam, validateUpdateInterview, handleValidationErrors, updateInterview);

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', validateIdParam, handleValidationErrors, deleteInterview);

module.exports = router;