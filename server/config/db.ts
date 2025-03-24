import mongoose from 'mongoose';
import { log } from '../vite';

export const connectDB = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb+srv://cogniflow:Cogniflow@123@cluster0.nv6lk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(connectionString);
    
    log('MongoDB connected successfully', 'database');
    
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'database');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'database');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed due to app termination', 'database');
      process.exit(0);
    });
    
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'database');
    // Retry connection after delay
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};