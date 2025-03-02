import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import DashboardHeatmaps from '@/components/DashboardHeatmaps';

async function getGoals(userId) {
  console.log('Dashboard: Connecting to database to fetch goals');
  await connectToDatabase();
  console.log('Dashboard: Database connected');
  
  console.log('Dashboard: Fetching goals for user:', userId);
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
  console.log('Dashboard: Found', goals.length, 'goals');
  
  return goals;
}

// Convert Mongoose documents to plain objects
function convertGoalsToPlainObjects(goals) {
  return goals.map(goal => {
    const plainGoal = {
      _id: goal._id.toString(),
      userId: goal.userId,
      title: goal.title,
      description: goal.description || '',
      color: goal.color,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString()
    };
    return plainGoal;
  });
}

export default async function Dashboard() {
  const user = await currentUser();
  
  if (!user) {
    return null; // This should be handled by Clerk middleware
  }
  
  console.log('Dashboard: User authenticated:', user.id);
  const goals = await getGoals(user.id);
  const plainGoals = convertGoalsToPlainObjects(goals);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-peach">Your Dashboard</h1>
        <Link href="/goals/new" className="btn btn-primary font-body">
          Add New Goal
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold mb-4 text-white">Welcome, {user.firstName || 'User'}</h2>
        <p className="text-medium-gray font-body">
          Track your progress and stay consistent with your goals.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card border-t-4 border-t-peach">
          <h3 className="text-xl font-heading font-bold mb-4 text-peach">Your Goals</h3>
          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <Link 
                  key={goal._id.toString()} 
                  href={`/goals/${goal._id.toString()}`}
                  className="block p-3 rounded-lg hover:bg-neutral-50 transition-colors border-l-4 font-body"
                  style={{ borderLeftColor: goal.color }}
                >
                  <h4 className="font-medium text-white">{goal.title}</h4>
                  {goal.description && (
                    <p className="text-sm text-medium-gray mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-medium-gray font-body">
              <p>You don't have any goals yet.</p>
              <Link href="/goals/new" className="text-peach hover:underline mt-2 inline-block">
                Create your first goal
              </Link>
            </div>
          )}
        </div>
        
        <div className="card border-t-4 border-t-taupe">
          <h3 className="text-xl font-heading font-bold mb-4 text-peach">Recent Activity</h3>
          <div className="text-center py-8 text-medium-gray font-body">
            <p>No recent activity to show.</p>
            <p className="text-sm mt-2">
              Your recent progress will appear here.
            </p>
          </div>
        </div>
      </div>
      
      <div className="card mb-8 p-4 border-t-4 border-t-brown">
        <h3 className="text-xl font-heading font-bold mb-2 text-peach">Your Progress Heatmaps</h3>
        <p className="text-xs text-medium-gray mb-3 font-body">Yearly progress for all your goals</p>
        {goals.length > 0 ? (
          <DashboardHeatmaps goals={plainGoals} />
        ) : (
          <div className="text-center py-6 text-medium-gray font-body">
            <p>Your progress heatmaps will appear here once you start tracking goals.</p>
          </div>
        )}
      </div>
    </main>
  );
} 