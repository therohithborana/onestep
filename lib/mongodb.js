import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Only log this once during startup
if (!global.mongoLoggedOnce) {
  console.log('MongoDB URI configured:', MONGODB_URI.substring(0, 20) + '...');
  global.mongoLoggedOnce = true;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    connectionCount: 0 
  };
}

async function connectToDatabase() {
  // Increment connection attempt counter
  cached.connectionCount = (cached.connectionCount || 0) + 1;
  
  if (cached.conn) {
    // Only log every 10th connection to reduce noise
    if (cached.connectionCount % 10 === 0) {
      console.log(`Using existing MongoDB connection (connection #${cached.connectionCount})`);
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    };

    console.log('Connecting to MongoDB...');
    
    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error:', error);
          
          // More detailed error information
          if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any MongoDB server. Please check:');
            console.error('1. Your network connection');
            console.error('2. MongoDB Atlas whitelist settings');
            console.error('3. MongoDB Atlas user credentials');
          }
          
          throw error;
        });
    } catch (error) {
      console.error('Error during MongoDB connection setup:', error);
      throw error;
    }
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error awaiting MongoDB connection:', error);
    throw error;
  }
}

export default connectToDatabase;