const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rate limiting middleware
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 signup attempts per windowMs
  message: {
    success: false,
    error: 'Too many signup attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware for signup
const validateSignup = [
  body('matricNumber')
    .notEmpty()
    .withMessage('Matric number is required')
    .matches(/^[A-Z0-9]+\/[A-Z0-9\/]+\/[A-Z0-9]+$/)
    .withMessage('Matric number must be in format: FUKU/SCI/21B/COM/0041 or CSC/2020/001'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters')
    .trim(),
  
  body('groupCode')
    .notEmpty()
    .withMessage('Group code is required')
    .isLength({ max: 20 })
    .withMessage('Group code cannot exceed 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Group code can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  
  // Custom middleware to check for validation errors
  (req, res, next) => {
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
  }
];

// Validation middleware for login
const validateLogin = [
  body('matricNumber')
    .notEmpty()
    .withMessage('Matric number is required')
    .matches(/^[A-Z0-9]+\/[A-Z0-9\/]+\/[A-Z0-9]+$/i)
    .withMessage('Matric number must be in format: FUKU/SCI/21B/COM/0041 or CSC/2020/001'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  // Custom middleware to check for validation errors
  (req, res, next) => {
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
  }
];

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', signupLimiter, validateSignup, signup);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginLimiter, validateLogin, login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;