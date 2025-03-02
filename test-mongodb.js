// test-mongodb.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGODB_URI.substring(0, 20) + '...');

mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  
  // List all collections
  return mongoose.connection.db.listCollections().toArray();
})
.then((collections) => {
  console.log('Available collections:');
  collections.forEach(collection => {
    console.log(`- ${collection.name}`);
  });
  
  // Close the connection
  return mongoose.connection.close();
})
.then(() => {
  console.log('Connection closed');
  process.exit(0);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  
  if (error.name === 'MongoServerSelectionError') {
    console.error('Could not connect to any MongoDB server. Please check:');
    console.error('1. Your network connection');
    console.error('2. MongoDB Atlas whitelist settings (IP address restrictions)');
    console.error('3. MongoDB Atlas user credentials');
    console.error('4. Database name in connection string');
  }
  
  process.exit(1);
}); 