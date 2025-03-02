import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import TrackProgressForm from '@/components/TrackProgressForm';
import mongoose from 'mongoose';

async function getGoal(id, userId) {
  await connectToDatabase();
  return Goal.findOne({ 
    _id: new mongoose.Types.ObjectId(id), 
    userId 
  });
}

export default async function TrackGoalPage({ params, searchParams }) {
  const user = await currentUser();
  
  if (!user) {
    return null; // This should be handled by Clerk middleware
  }
  
  const goal = await getGoal(params.id, user.id);
  
  if (!goal) {
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

  // Get the date from the URL query parameters or use today's date
  const initialDate = searchParams?.date || new Date().toISOString().split('T')[0];

  return (
    <main className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Link href={`/goals/${params.id}`} className="text-primary-600 hover:underline text-sm sm:text-base">
          &larr; Back to Goal
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4">Track Progress: {goal.title}</h1>
      </div>
      
      <div className="card max-w-2xl mx-auto">
        <TrackProgressForm goalId={params.id} initialDate={initialDate} />
      </div>
    </main>
  );
} 