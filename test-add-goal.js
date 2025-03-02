// test-add-goal.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define the Goal schema
const GoalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: '#0ea5e9',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Goal model
const Goal = mongoose.model('Goal', GoalSchema);

async function addTestGoal() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create a test goal
    const testGoal = new Goal({
      userId: 'test-user-123',
      title: 'Test Goal',
      description: 'This is a test goal created via script',
      color: '#10b981',
    });
    
    console.log('Saving test goal...');
    await testGoal.save();
    console.log('Test goal saved successfully!');
    console.log('Goal ID:', testGoal._id.toString());
    
    // Verify the goal was saved
    const goals = await Goal.find({ userId: 'test-user-123' });
    console.log('Goals in database for test user:', goals);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestGoal(); 