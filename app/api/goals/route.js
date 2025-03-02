import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    console.log('POST /api/goals: Starting request');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('POST /api/goals: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('POST /api/goals: Authenticated user:', userId);
    
    let body;
    try {
      body = await request.json();
      console.log('POST /api/goals: Request body parsed successfully');
    } catch (parseError) {
      console.error('POST /api/goals: Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: parseError.message 
      }, { status: 400 });
    }
    
    const { title, description, color } = body;
    
    console.log('POST /api/goals: Request body:', { title, description, color });
    
    if (!title) {
      console.log('POST /api/goals: Missing title');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    console.log('POST /api/goals: Connecting to database');
    try {
      await connectToDatabase();
      console.log('POST /api/goals: Database connected');
    } catch (dbError) {
      console.error('POST /api/goals: Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError.message 
      }, { status: 500 });
    }
    
    const newGoal = new Goal({
      userId,
      title,
      description,
      color,
    });
    
    console.log('POST /api/goals: Saving new goal');
    try {
      await newGoal.save();
      console.log('POST /api/goals: Goal saved successfully:', newGoal._id);
    } catch (saveError) {
      console.error('POST /api/goals: Error saving goal:', saveError);
      return NextResponse.json({ 
        error: 'Failed to save goal', 
        details: saveError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ 
      error: 'Failed to create goal', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('GET /api/goals: Starting request');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('GET /api/goals: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('GET /api/goals: Authenticated user:', userId);
    console.log('GET /api/goals: Connecting to database');
    
    try {
      await connectToDatabase();
      console.log('GET /api/goals: Database connected');
    } catch (dbError) {
      console.error('GET /api/goals: Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError.message 
      }, { status: 500 });
    }
    
    console.log('GET /api/goals: Fetching goals for user:', userId);
    let goals;
    try {
      goals = await Goal.find({ userId }).sort({ createdAt: -1 });
      console.log('GET /api/goals: Found', goals.length, 'goals');
    } catch (queryError) {
      console.error('GET /api/goals: Error querying goals:', queryError);
      return NextResponse.json({ 
        error: 'Failed to query goals', 
        details: queryError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch goals', 
      details: error.message 
    }, { status: 500 });
  }
} 