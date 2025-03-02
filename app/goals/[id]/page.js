import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import RecentActivity from '@/components/RecentActivity';
import GoalProgressSection from '@/components/GoalProgressSection';
import mongoose from 'mongoose';

async function getGoal(id, userId) {
  console.log(`GoalPage: Fetching goal ${id} for user ${userId}`);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`GoalPage: Invalid ObjectId format: ${id}`);
      return null;
    }
    
    await connectToDatabase();
    console.log('GoalPage: Database connected');
    
    console.log(`GoalPage: Executing query with _id: ${id}, userId: ${userId}`);
    const goal = await Goal.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId 
    });
    
    if (goal) {
      console.log('GoalPage: Goal found:', goal._id.toString());
      console.log('GoalPage: Goal data:', JSON.stringify(goal, null, 2));
    } else {
      console.log(`GoalPage: No goal found with id ${id} for user ${userId}`);
    }
    
    return goal;
  } catch (error) {
    console.error('GoalPage: Error fetching goal:', error);
    return null;
  }
}

export default async function GoalPage({ params }) {
  console.log('GoalPage: Rendering with params:', params);
  
  const user = await currentUser();
  
  if (!user) {
    console.log('GoalPage: No authenticated user');
    return null; // This should be handled by Clerk middleware
  }
  
  console.log('GoalPage: User authenticated:', user.id);
  
  const goal = await getGoal(params.id, user.id);
  
  if (!goal) {
    console.log('GoalPage: Rendering not found page');
    return (
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Goal Not Found</h1>
          <p className="mb-6">The goal you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  console.log('GoalPage: Rendering goal page for:', goal.title);
  return (
    <main className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline text-sm sm:text-base">
          &larr; Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{goal.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Link href={`/goals/${params.id}/edit`} className="btn btn-secondary text-sm sm:text-base w-full sm:w-auto">
              Edit Goal
            </Link>
            <Link href={`/goals/${params.id}/track`} className="btn btn-primary text-sm sm:text-base w-full sm:w-auto">
              Track Progress
            </Link>
          </div>
        </div>
        {goal.description && (
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">{goal.description}</p>
        )}
      </div>
      
      <GoalProgressSection goalId={params.id} />
      
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 font-heading text-peach">Recent Activity</h2>
        <RecentActivity goalId={params.id} />
      </div>
    </main>
  );
} 