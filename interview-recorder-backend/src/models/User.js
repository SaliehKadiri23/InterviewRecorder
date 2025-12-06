const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  matricNumber: {
    type: String,
    required: [true, 'Matric number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]+\/[A-Z0-9\/]+\/[A-Z0-9]+$/, 'Please enter a valid matric number format (e.g., FUKU/SCI/21B/COM/0041 or CSC/2020/001)'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  groupCode: {
    type: String,
    required: [true, 'Group code is required'],
    trim: true,
    index: true
  },
  role: {
    type: String,
    enum: ['interviewer', 'admin'],
    default: 'interviewer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update lastLogin when user logs in
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Create indexes
userSchema.index({ matricNumber: 1 }, { unique: true });
userSchema.index({ groupCode: 1 });

module.exports = mongoose.model('User', userSchema);