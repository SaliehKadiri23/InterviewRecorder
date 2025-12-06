const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'matricNumber', // Use matricNumber instead of email
      passwordField: 'password'
    },
    async (matricNumber, password, done) => {
      try {
        // Find user by matric number (case insensitive)
        const user = await User.findOne({ 
          matricNumber: matricNumber.toUpperCase() 
        });
        
        // If user doesn't exist
        if (!user) {
          return done(null, false, { message: 'Invalid matric number or password' });
        }
        
        // Compare password using the comparePassword method
        const isMatch = await user.comparePassword(password);
        
        // If password doesn't match
        if (!isMatch) {
          return done(null, false, { message: 'Invalid matric number or password' });
        }
        
        // User authenticated successfully
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        // Find user by ID from token payload
        const user = await User.findById(payload.userId);
        
        if (user) {
          // User found, return user object
          return done(null, user);
        } else {
          // User not found
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session support
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user for session support
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;