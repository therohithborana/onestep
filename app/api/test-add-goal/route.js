import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    console.log('TEST-ADD-GOAL: Starting request');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('TEST-ADD-GOAL: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('TEST-ADD-GOAL: Authenticated user:', userId);
    
    // Connect to database
    console.log('TEST-ADD-GOAL: Connecting to database');
    try {
      await connectToDatabase();
      console.log('TEST-ADD-GOAL: Database connected');
    } catch (dbError) {
      console.error('TEST-ADD-GOAL: Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError.message 
      }, { status: 500 });
    }
    
    // Create a test goal
    const testGoal = new Goal({
      userId,
      title: `Test Goal ${new Date().toISOString()}`,
      description: 'This is a test goal created via the test API route',
      color: '#10b981',
    });
    
    console.log('TEST-ADD-GOAL: Saving test goal');
    try {
      await testGoal.save();
      console.log('TEST-ADD-GOAL: Goal saved successfully:', testGoal._id);
    } catch (saveError) {
      console.error('TEST-ADD-GOAL: Error saving goal:', saveError);
      return NextResponse.json({ 
        error: 'Failed to save goal', 
        details: saveError.message 
      }, { status: 500 });
    }
    
    // Verify the goal was saved by fetching it back
    console.log('TEST-ADD-GOAL: Verifying goal was saved');
    let savedGoal;
    try {
      savedGoal = await Goal.findById(testGoal._id);
      if (!savedGoal) {
        throw new Error('Goal not found after saving');
      }
      console.log('TEST-ADD-GOAL: Goal verified:', savedGoal._id);
    } catch (verifyError) {
      console.error('TEST-ADD-GOAL: Error verifying goal:', verifyError);
      return NextResponse.json({ 
        error: 'Failed to verify goal was saved', 
        details: verifyError.message,
        goalId: testGoal._id
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Test goal created successfully',
      goal: testGoal
    }, { status: 201 });
    
  } catch (error) {
    console.error('TEST-ADD-GOAL: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Failed to create test goal', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 