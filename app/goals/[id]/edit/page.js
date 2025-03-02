import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import EditGoalForm from '@/components/EditGoalForm';
import mongoose from 'mongoose';

async function getGoal(id, userId) {
  console.log('EditGoalPage: Fetching goal', id, 'for user', userId);
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('EditGoalPage: Invalid ObjectId format:', id);
    return null;
  }
  
  try {
    console.log('EditGoalPage: Connecting to database');
    await connectToDatabase();
    console.log('EditGoalPage: Database connected');
    
    console.log('EditGoalPage: Executing query with _id:', id, 'userId:', userId);
    const goal = await Goal.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId 
    });
    
    if (goal) {
      console.log('EditGoalPage: Goal found:', goal._id);
    } else {
      console.log('EditGoalPage: Goal not found');
    }
    
    return goal;
  } catch (error) {
    console.error('EditGoalPage: Error fetching goal:', error);
    return null;
  }
}

export default async function EditGoalPage({ params }) {
  console.log('EditGoalPage: Rendering with params:', params);
  
  const user = await currentUser();
  
  if (!user) {
    console.log('EditGoalPage: No authenticated user');
    return null; // This should be handled by Clerk middleware
  }
  
  console.log('EditGoalPage: User authenticated:', user.id);
  
  const goal = await getGoal(params.id, user.id);
  
  if (!goal) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4">Goal Not Found</h1>
        </div>
        
        <div className="card">
          <p className="text-neutral-600 mb-4">
            The goal you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link href="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }
  
  console.log('EditGoalPage: Rendering edit page for:', goal.title);
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/goals/${params.id}`} className="text-primary-600 hover:underline">
          &larr; Back to Goal
        </Link>
        <h1 className="text-3xl font-bold mt-4">Edit Goal</h1>
      </div>
      
      <div className="card max-w-2xl mx-auto">
        <EditGoalForm 
          goalId={params.id} 
          initialData={{
            title: goal.title,
            description: goal.description,
            color: goal.color
          }} 
        />
      </div>
    </main>
  );
} 