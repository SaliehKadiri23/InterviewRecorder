const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Log when connected
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    // Log when disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
    });

    // Log when there's an error
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;