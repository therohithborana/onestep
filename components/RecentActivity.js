'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function RecentActivity({ goalId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Memoize the date calculations
  const { startDate, endDate } = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      startDate: thirtyDaysAgo,
      endDate: new Date()
    };
  }, []);
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `/api/progress?goalId=${goalId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent activity');
        }
        
        const data = await response.json();
        
        // Sort by date, most recent first
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setActivities(sortedData);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (goalId) {
      fetchRecentActivity();
    }
  }, [goalId]);
  
  if (loading) {
    return <div className="text-center py-4">Loading recent activity...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>No recent activity to show.</p>
        <Link href={`/goals/${goalId}/track`} className="text-primary-600 hover:underline mt-2 inline-block">
          Start tracking your progress
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity._id} 
          className="p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {format(new Date(activity.date), 'MMMM d, yyyy')}
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                Status: {activity.completed ? 'Completed' : 'Not completed'}
              </div>
            </div>
            <Link 
              href={`/goals/${goalId}/track?date=${activity.date.substring(0, 10)}`}
              className="text-sm text-primary-600 hover:underline"
            >
              Edit
            </Link>
          </div>
          
          {activity.notes && (
            <div className="mt-2 text-sm border-t pt-2">
              <div className="font-medium mb-1">Notes:</div>
              <p className="text-neutral-700">{activity.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 