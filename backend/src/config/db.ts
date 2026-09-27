import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB using the connection string from environment variables.
 * MONGO_URI must be provided via process.env.MONGO_URI.
 */
export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI === 'your_mongodb_connection_string_here') {
    console.warn(
      '[Database] Warning: process.env.MONGO_URI is not configured or is using placeholder. Running in fallback mode.'
    );
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    isConnected = false;
    return false;
  }
};

export const isDbConnected = (): boolean => isConnected;
