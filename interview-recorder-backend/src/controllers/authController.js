const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { matricNumber, password, fullName, groupCode } = req.body;

    // Validation
    if (!matricNumber || !password || !fullName || !groupCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide matric number, password, full name, and group code'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      matricNumber: matricNumber.toUpperCase() 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Matric number already exists'
      });
    }

    // Create new user
    const user = await User.create({
      matricNumber: matricNumber.toUpperCase(),
      password,
      fullName,
      groupCode
    });

    // Generate token
    const token = generateToken(user._id);

    // Return success response (excluding password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        matricNumber: user.matricNumber,
        fullName: user.fullName,
        groupCode: user.groupCode
      }
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle validation errors from mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    // Handle duplicate key error (matric number already exists)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Matric number already exists'
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      error: 'Server error during signup'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { matricNumber, password } = req.body;

    // Validation
    if (!matricNumber || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide matric number and password'
      });
    }

    // Find user by matric number
    const user = await User.findOne({ 
      matricNumber: matricNumber.toUpperCase() 
    }).select('+password'); // Include password field temporarily

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password using the comparePassword method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Return success response (excluding password)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        matricNumber: user.matricNumber,
        fullName: user.fullName,
        groupCode: user.groupCode
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Return user info (excluding password)
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        matricNumber: req.user.matricNumber,
        fullName: req.user.fullName,
        groupCode: req.user.groupCode,
        role: req.user.role,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error getting user info'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is typically handled client-side
    // by removing the token from local storage or cookies.
    // But we can still respond with a success message.
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
  generateToken
};