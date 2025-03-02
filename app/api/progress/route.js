import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Progress from '@/models/Progress';
import Goal from '@/models/Goal';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { goalId, date, completed, notes } = await request.json();
    
    if (!goalId || !date) {
      return NextResponse.json({ error: 'Goal ID and date are required' }, { status: 400 });
    }
    
    console.log('POST /api/progress: Processing request with date:', date);
    
    await connectToDatabase();
    
    // Verify the goal belongs to the user
    const goal = await Goal.findOne({ 
      _id: new mongoose.Types.ObjectId(goalId), 
      userId 
    });
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    // Create or update progress
    // Ensure we're using the correct date by parsing it properly and setting to midnight UTC
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    
    console.log('POST /api/progress: Formatted date for storage:', formattedDate.toISOString());
    
    const progress = await Progress.findOneAndUpdate(
      { userId, goalId, date: formattedDate },
      { completed, notes, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    console.log('POST /api/progress: Progress saved with date:', progress.date);
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error tracking progress:', error);
    return NextResponse.json({ error: 'Failed to track progress' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('GET /api/progress: Starting request');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('GET /api/progress: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('GET /api/progress: Authenticated user:', userId);
    
    const url = new URL(request.url);
    const goalId = url.searchParams.get('goalId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const date = url.searchParams.get('date'); // Add support for specific date
    
    console.log('GET /api/progress: Query parameters:', { goalId, startDate, endDate, date });
    
    console.log('GET /api/progress: Connecting to database');
    await connectToDatabase();
    console.log('GET /api/progress: Database connected');
    
    const query = { userId };
    
    if (goalId) {
      query.goalId = goalId; // Don't convert to ObjectId as it might be a string already
    }
    
    // If specific date is provided, use that instead of date range
    if (date) {
      query.date = date;
      console.log('GET /api/progress: Filtering by specific date:', date);
    } else if (startDate && endDate) {
      // Ensure dates are properly formatted for MongoDB query
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end,
      };
      
      console.log('GET /api/progress: Formatted date range:', {
        start: start.toISOString(),
        end: end.toISOString()
      });
    }
    
    console.log('GET /api/progress: Executing query with filter:', JSON.stringify(query));
    
    const progress = await Progress.find(query).sort({ date: -1 });
    
    console.log('GET /api/progress: Found', progress.length, 'progress records');
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
} 