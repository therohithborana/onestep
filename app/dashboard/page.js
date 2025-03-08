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
    <main className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--accent)]">Your Dashboard</h1>
        <Link href="/goals/new" className="btn btn-primary font-body w-full sm:w-auto text-center">
          Add New Goal
        </Link>
      </div>
      
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-heading font-bold mb-3 sm:mb-4 text-text-primary">Welcome, {user.firstName || 'User'}</h2>
        <p className="text-text-secondary font-body text-sm sm:text-base">
          Track your progress and stay consistent with your goals.
        </p>
      </div>
      
      <div className="mb-6 sm:mb-8">
        <div className="card border-t-4 border-t-[var(--accent)]">
          <h3 className="text-lg sm:text-xl font-heading font-bold mb-3 sm:mb-4 text-[var(--accent)]">Your Goals</h3>
          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <Link 
                  key={goal._id.toString()} 
                  href={`/goals/${goal._id.toString()}`}
                  className="block p-3 rounded-lg transition-colors border-l-4 font-body hover:bg-[var(--accent)] hover:bg-opacity-5"
                  style={{ borderLeftColor: goal.color }}
                >
                  <h4 className="font-medium text-text-primary">{goal.title}</h4>
                  {goal.description && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-text-secondary font-body">
              <p>You don't have any goals yet.</p>
              <Link href="/goals/new" className="text-[var(--accent)] hover:underline mt-2 inline-block">
                Create your first goal
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="card mb-6 sm:mb-8 p-3 sm:p-4 border-t-4 border-t-[var(--accent)] overflow-x-auto">
        <h3 className="text-lg sm:text-xl font-heading font-bold mb-2 text-[var(--accent)]">Your Progress Heatmaps</h3>
        <p className="text-xs text-text-secondary mb-3 font-body">Yearly progress for all your goals</p>
        {goals.length > 0 ? (
          <div className="min-w-[600px]">
            <DashboardHeatmaps goals={plainGoals} />
          </div>
        ) : (
          <div className="text-center py-6 text-text-secondary font-body">
            <p>Your progress heatmaps will appear here once you start tracking goals.</p>
          </div>
        )}
      </div>
    </main>
  );
} 