const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc      Create new interview
// @route     POST /api/interviews
// @access    Private
const createInterview = async (req, res) => {
  try {
    const { intervieweeName, intervieweeRole, responses } = req.body;

    // Validation
    if (!intervieweeName || !intervieweeRole || !responses) {
      return res.status(400).json({
        success: false,
        error: 'Please provide intervieweeName, intervieweeRole, and responses'
      });
    }

    // Validate intervieweeRole
    const validRoles = ['Student', 'Class Rep', 'Lecturer'];
    if (!validRoles.includes(intervieweeRole)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid interviewee role. Must be Student, Class Rep, or Lecturer'
      });
    }

    // Create interview with auto-populated fields from user
    const interview = await Interview.create({
      interviewerId: req.user.id,
      interviewerMatricNumber: req.user.matricNumber,
      groupCode: req.user.groupCode,
      intervieweeName,
      intervieweeRole,
      responses
    });

    res.status(201).json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Create interview error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating interview'
    });
  }
};

// @desc      Get all interviews for user's group
// @route     GET /api/interviews
// @access    Private
const getGroupInterviews = async (req, res) => {
  try {
    // Extract query parameters
    const { role } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { groupCode: req.user.groupCode };
    
    // Add role filter if provided
    if (role) {
      const validRoles = ['Student', 'Class Rep', 'Lecturer'];
      if (validRoles.includes(role)) {
        filter.intervieweeRole = role;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid role filter. Must be Student, Class Rep, or Lecturer'
        });
      }
    }

    // Get interviews with pagination
    const interviews = await Interview.find(filter)
      .populate('interviewerId', 'fullName matricNumber')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Interview.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: interviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: interviews
    });

  } catch (error) {
    console.error('Get group interviews error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error getting interviews'
    });
  }
};

// @desc      Get interviews conducted by current user
// @route     GET /api/interviews/my
// @access    Private
const getMyInterviews = async (req, res) => {
  try {
    // Extract query parameters
    const { role } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { 
      interviewerId: req.user.id,
      groupCode: req.user.groupCode
    };
    
    // Add role filter if provided
    if (role) {
      const validRoles = ['Student', 'Class Rep', 'Lecturer'];
      if (validRoles.includes(role)) {
        filter.intervieweeRole = role;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid role filter. Must be Student, Class Rep, or Lecturer'
        });
      }
    }

    // Get interviews with pagination
    const interviews = await Interview.find(filter)
      .populate('interviewerId', 'fullName matricNumber')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Interview.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: interviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: interviews
    });

  } catch (error) {
    console.error('Get my interviews error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error getting interviews'
    });
  }
};

// @desc      Get single interview
// @route     GET /api/interviews/:id
// @access    Private
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('interviewerId', 'fullName matricNumber');

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Check if the interview belongs to the user's group
    if (interview.groupCode !== req.user.groupCode) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this interview'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Get interview error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid interview ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error getting interview'
    });
  }
};

// @desc      Update interview
// @route     PUT /api/interviews/:id
// @access    Private
const updateInterview = async (req, res) => {
  try {
    const { intervieweeName, intervieweeRole, responses } = req.body;

    // Find interview
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Check if user is the interviewer who created it
    if (interview.interviewerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this interview'
      });
    }

    // Update allowed fields
    if (intervieweeName) interview.intervieweeName = intervieweeName;
    if (intervieweeRole) {
      const validRoles = ['Student', 'Class Rep', 'Lecturer'];
      if (!validRoles.includes(intervieweeRole)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid interviewee role. Must be Student, Class Rep, or Lecturer'
        });
      }
      interview.intervieweeRole = intervieweeRole;
    }
    if (responses) interview.responses = responses;

    const updatedInterview = await interview.save();

    res.status(200).json({
      success: true,
      data: updatedInterview
    });

  } catch (error) {
    console.error('Update interview error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid interview ID'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error updating interview'
    });
  }
};

// @desc      Delete interview
// @route     DELETE /api/interviews/:id
// @access    Private
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Check if user is the interviewer who created it
    if (interview.interviewerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this interview'
      });
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Delete interview error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid interview ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error deleting interview'
    });
  }
};

// @desc      Get interview statistics for user's group
// @route     GET /api/interviews/stats
// @access    Private
const getStats = async (req, res) => {
  try {
    // Calculate date for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get total interviews and breakdown by role
    const totalInterviews = await Interview.countDocuments({
      groupCode: req.user.groupCode
    });

    const roleBreakdown = await Interview.aggregate([
      { $match: { groupCode: req.user.groupCode } },
      {
        $group: {
          _id: '$intervieweeRole',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get breakdown by interviewer
    const interviewerBreakdown = await Interview.aggregate([
      { $match: { groupCode: req.user.groupCode } },
      {
        $group: {
          _id: '$interviewerId',
          count: { $sum: 1 },
          matricNumber: { $first: '$interviewerMatricNumber' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          count: 1,
          matricNumber: 1,
          fullName: { $arrayElemAt: ['$userDetails.fullName', 0] }
        }
      }
    ]);

    // Get recent interviews count (last 7 days)
    const recentInterviewsCount = await Interview.countDocuments({
      groupCode: req.user.groupCode,
      timestamp: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        roleBreakdown: roleBreakdown.map(item => ({
          role: item._id,
          count: item.count
        })),
        interviewerBreakdown: interviewerBreakdown.map(item => ({
          matricNumber: item.matricNumber,
          fullName: item.fullName,
          count: item.count
        })),
        recentInterviewsCount,
        recentPeriod: '7 days'
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);

    res.status(500).json({
      success: false,
      error: 'Server error getting statistics'
    });
  }
};

module.exports = {
  createInterview,
  getGroupInterviews,
  getMyInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  getStats
};