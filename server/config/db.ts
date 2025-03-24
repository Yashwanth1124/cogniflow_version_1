import mongoose from 'mongoose';
import { log } from '../vite';

// The connection string needs to be properly formatted for MongoDB
// Note: "@" in passwords needs special handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cogniflow:Cogniflow%40123@cluster0.nv6lk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    log('MongoDB connected successfully', 'database');
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'database');
    // Don't exit the process in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('error', (err) => {
  log(`MongoDB connection error: ${err}`, 'database');
});

mongoose.connection.on('disconnected', () => {
  log('MongoDB disconnected', 'database');
});

// Handle application shutdown properly
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  log('MongoDB connection closed due to app termination', 'database');
  process.exit(0);
});

export default mongoose;