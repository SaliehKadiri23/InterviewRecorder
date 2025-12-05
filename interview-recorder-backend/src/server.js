const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Body parser middleware
app.use(express.json({ extended: false }));

// CORS middleware
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server Error' 
  });
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;