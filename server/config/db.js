import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('MongoDB error: MONGODB_URL environment variable is not set');
  process.exit(1);
}

// Connection options to handle connection issues
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10s
  retryWrites: true,
  retryReads: true,
};

mongoose.connect(MONGODB_URL, mongooseOptions)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Error details:', {
      code: err.code,
      hostname: err.hostname,
      message: err.message
    });
    
    // If connection fails, the app can still run but requests won't be saved
    // You might want to handle this differently based on your needs
    console.warn('Warning: MongoDB connection failed. Request storage may not work.');
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

export default mongoose;