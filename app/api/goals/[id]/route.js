import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    console.log('GET /api/goals/[id]: Starting request for goal ID:', params.id);
    const { userId } = await auth();
    
    if (!userId) {
      console.log('GET /api/goals/[id]: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('GET /api/goals/[id]: Authenticated user:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.error('GET /api/goals/[id]: Invalid ObjectId format:', params.id);
      return NextResponse.json({ error: 'Invalid goal ID format' }, { status: 400 });
    }
    
    console.log('GET /api/goals/[id]: Connecting to database');
    await connectToDatabase();
    console.log('GET /api/goals/[id]: Database connected');
    
    console.log('GET /api/goals/[id]: Fetching goal with ID:', params.id);
    const goal = await Goal.findOne({ 
      _id: new mongoose.Types.ObjectId(params.id), 
      userId 
    });
    
    if (!goal) {
      console.log('GET /api/goals/[id]: Goal not found');
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    console.log('GET /api/goals/[id]: Goal found:', goal._id);
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    console.log('PUT /api/goals/[id]: Starting request for goal ID:', params.id);
    const { userId } = await auth();
    
    if (!userId) {
      console.log('PUT /api/goals/[id]: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('PUT /api/goals/[id]: Authenticated user:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.error('PUT /api/goals/[id]: Invalid ObjectId format:', params.id);
      return NextResponse.json({ error: 'Invalid goal ID format' }, { status: 400 });
    }
    
    const { title, description, color } = await request.json();
    
    if (!title) {
      console.log('PUT /api/goals/[id]: Missing required field: title');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    console.log('PUT /api/goals/[id]: Connecting to database');
    await connectToDatabase();
    console.log('PUT /api/goals/[id]: Database connected');
    
    console.log('PUT /api/goals/[id]: Updating goal with ID:', params.id);
    const goal = await Goal.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(params.id), 
        userId 
      },
      { 
        title, 
        description, 
        color,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!goal) {
      console.log('PUT /api/goals/[id]: Goal not found');
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    console.log('PUT /api/goals/[id]: Goal updated successfully:', goal._id);
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log('DELETE /api/goals/[id]: Starting request for goal ID:', params.id);
    const { userId } = await auth();
    
    if (!userId) {
      console.log('DELETE /api/goals/[id]: Unauthorized - No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('DELETE /api/goals/[id]: Authenticated user:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.error('DELETE /api/goals/[id]: Invalid ObjectId format:', params.id);
      return NextResponse.json({ error: 'Invalid goal ID format' }, { status: 400 });
    }
    
    console.log('DELETE /api/goals/[id]: Connecting to database');
    await connectToDatabase();
    console.log('DELETE /api/goals/[id]: Database connected');
    
    console.log('DELETE /api/goals/[id]: Deleting goal with ID:', params.id);
    const result = await Goal.deleteOne({ 
      _id: new mongoose.Types.ObjectId(params.id), 
      userId 
    });
    
    if (result.deletedCount === 0) {
      console.log('DELETE /api/goals/[id]: Goal not found');
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    console.log('DELETE /api/goals/[id]: Goal deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
} 