import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';

export default async function GoalsIndexPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="mb-4">You need to be signed in to view your goals.</p>
      </div>
    );
  }
  
  const goals = await getGoals(user.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Goals</h1>
        <Link href="/goals/new" className="btn btn-primary">
          Create New Goal
        </Link>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Goals Yet</h2>
          <p className="text-neutral-600 mb-6">
            Create your first goal to start tracking your progress.
          </p>
          <Link href="/goals/new" className="btn btn-primary">
            Create Your First Goal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Link 
              key={goal._id} 
              href={`/goals/${goal._id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 border-t-4" style={{ borderColor: goal.color || '#0ea5e9' }}>
                <h2 className="text-xl font-semibold mb-2">{goal.title}</h2>
                {goal.description && (
                  <p className="text-neutral-600 mb-4 line-clamp-2">{goal.description}</p>
                )}
                <div className="text-sm text-neutral-500">
                  Created: {new Date(goal.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function getGoals(userId) {
  console.log('Goals Page: Fetching goals for user:', userId);
  
  try {
    console.log('Goals Page: Connecting to database');
    await connectToDatabase();
    console.log('Goals Page: Database connected');
    
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    console.log('Goals Page: Found', goals.length, 'goals');
    
    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}