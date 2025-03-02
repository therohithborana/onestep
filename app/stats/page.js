import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Progress from '@/models/Progress';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export default async function StatsPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="mb-4">You need to be signed in to view your statistics.</p>
      </div>
    );
  }
  
  const stats = await getStats(user.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Goals" value={stats.totalGoals} />
        <StatCard title="Active Goals" value={stats.activeGoals} />
        <StatCard title="Total Progress Entries" value={stats.totalProgressEntries} />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.monthlyActivity.map((month) => (
            <div key={month.month} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{month.month}</h3>
              <p className="text-2xl font-bold">{month.count} entries</p>
              <p className="text-sm text-neutral-500">
                {month.completedCount} completed ({month.completionRate}%)
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {stats.goalStats.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Goal Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Entries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.goalStats.map((goal) => (
                  <tr key={goal.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: goal.color }}></div>
                        <div className="font-medium">{goal.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{goal.entries}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{goal.completionRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{goal.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Goal Data Yet</h2>
          <p className="text-neutral-600">
            Start tracking your goals to see statistics.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-sm font-medium text-neutral-500 mb-1">{title}</h2>
      <p className="text-3xl font-bold text-black">{value}</p>
    </div>
  );
}

async function getStats(userId) {
  console.log('Stats Page: Fetching statistics for user:', userId);
  
  try {
    console.log('Stats Page: Connecting to database');
    await connectToDatabase();
    console.log('Stats Page: Database connected');
    
    // Get all goals
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    console.log('Stats Page: Found', goals.length, 'goals');
    
    // Get all progress entries
    const progress = await Progress.find({ userId });
    console.log('Stats Page: Found', progress.length, 'progress entries');
    
    // Calculate completion rate
    const completedEntries = progress.filter(entry => entry.completed).length;
    const completionRate = progress.length > 0 
      ? Math.round((completedEntries / progress.length) * 100) 
      : 0;
    
    // Calculate monthly activity for the last 3 months
    const monthlyActivity = [];
    const now = new Date();
    
    for (let i = 0; i < 3; i++) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthEntries = progress.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
      
      const monthCompletedEntries = monthEntries.filter(entry => entry.completed);
      
      monthlyActivity.push({
        month: format(monthDate, 'MMMM yyyy'),
        count: monthEntries.length,
        completedCount: monthCompletedEntries.length,
        completionRate: monthEntries.length > 0 
          ? Math.round((monthCompletedEntries.length / monthEntries.length) * 100)
          : 0
      });
    }
    
    // Calculate stats per goal
    const goalStats = goals.map(goal => {
      const goalEntries = progress.filter(entry => entry.goalId.toString() === goal._id.toString());
      const goalCompletedEntries = goalEntries.filter(entry => entry.completed);
      
      // Find the most recent entry
      let lastUpdated = 'Never';
      if (goalEntries.length > 0) {
        const dates = goalEntries.map(entry => new Date(entry.updatedAt));
        const mostRecent = new Date(Math.max(...dates));
        lastUpdated = format(mostRecent, 'MMM d, yyyy');
      }
      
      return {
        id: goal._id.toString(),
        title: goal.title,
        color: goal.color,
        entries: goalEntries.length,
        completedEntries: goalCompletedEntries.length,
        completionRate: goalEntries.length > 0 
          ? Math.round((goalCompletedEntries.length / goalEntries.length) * 100)
          : 0,
        lastUpdated
      };
    });
    
    return {
      totalGoals: goals.length,
      activeGoals: goals.length, // For now, all goals are considered active
      totalProgressEntries: progress.length,
      completionRate,
      monthlyActivity,
      goalStats
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      totalGoals: 0,
      activeGoals: 0,
      totalProgressEntries: 0,
      completionRate: 0,
      monthlyActivity: [],
      goalStats: []
    };
  }
} 