'use client';

import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { format, startOfYear, endOfYear } from 'date-fns';
import Link from 'next/link';

export default function DashboardHeatmaps({ goals }) {
  const [goalHeatmaps, setGoalHeatmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get full year date range
  const today = new Date();
  const startDate = startOfYear(today);
  const endDate = endOfYear(today);
  const currentYear = format(today, 'yyyy');
  
  // Custom weekday labels
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Function to strip HTML tags for tooltip display
  const stripHtmlTags = (html) => {
    if (!html) return '';
    if (typeof window === 'undefined') return html.replace(/<[^>]*>?/gm, '');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  useEffect(() => {
    const fetchAllGoalsProgress = async () => {
      if (!goals || goals.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('DashboardHeatmaps: Fetching progress for', goals.length, 'goals');
        
        const heatmapData = await Promise.all(
          goals.map(async (goal) => {
            const goalId = goal._id.toString();
            
            console.log(`DashboardHeatmaps: Fetching for goal ${goalId} (${goal.title})`);
            console.log('DashboardHeatmaps: Date range:', {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            });
            
            try {
              const response = await fetch(
                `/api/progress?goalId=${goalId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
              );
              
              if (!response.ok) {
                throw new Error(`Failed to fetch progress data: ${response.status}`);
              }
              
              const data = await response.json();
              console.log(`DashboardHeatmaps: Received ${data.length} records for ${goal.title}`);
              
              // Transform data for the heatmap
              const formattedData = data.map(item => {
                const dateObj = new Date(item.date);
                const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                
                return {
                  date: formattedDate,
                  count: item.completed ? 1 : 0,
                  notes: item.notes || '',
                };
              });
              
              // Calculate completion percentage for the current year
              const daysInYear = 365 + (new Date(today.getFullYear(), 1, 29).getDate() === 29 ? 1 : 0);
              const completedDays = formattedData.filter(d => d.count > 0).length;
              const completionPercentage = daysInYear > 0 
                ? Math.round((completedDays / daysInYear) * 100) 
                : 0;
              
              return {
                goal,
                progressData: formattedData,
                completedDays,
                daysInYear,
                completionPercentage
              };
            } catch (error) {
              console.error(`Error fetching progress for goal ${goal.title}:`, error);
              return {
                goal,
                progressData: [],
                completedDays: 0,
                daysInYear: 365 + (new Date(today.getFullYear(), 1, 29).getDate() === 29 ? 1 : 0),
                completionPercentage: 0,
                error: error.message
              };
            }
          })
        );
        
        setGoalHeatmaps(heatmapData);
      } catch (error) {
        console.error('Error fetching all goals progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllGoalsProgress();
  }, [goals]);
  
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return null;
    }
    
    const date = format(new Date(value.date), 'MMM d, yyyy');
    const status = value.count > 0 ? 'Completed' : 'Not completed';
    
    // Strip HTML tags for tooltip display
    const plainTextNotes = stripHtmlTags(value.notes);
    const notesPreview = plainTextNotes ? 
      (plainTextNotes.length > 50 ? plainTextNotes.substring(0, 50) + '...' : plainTextNotes) : '';
    
    return {
      'data-tooltip-id': 'dashboard-heatmap-tooltip',
      'data-tooltip-content': `${date}: ${status}${notesPreview ? `\nNotes: ${notesPreview}` : ''}`,
    };
  };
  
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    return `color-scale-${value.count}`;
  };
  
  if (loading) {
    return <div className="text-center py-6 font-body text-medium-gray">Loading heatmaps...</div>;
  }
  
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-6 text-medium-gray font-body">
        <p>You don't have any goals yet.</p>
        <p className="text-sm mt-2">Create goals to see your progress heatmaps.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h4 className="text-lg font-heading font-medium text-peach">{currentYear} Progress</h4>
      </div>
      
      <Tooltip id="dashboard-heatmap-tooltip" />
      
      {goalHeatmaps.map(({ goal, progressData, error, completedDays, daysInYear, completionPercentage }) => (
        <div key={goal._id.toString()} className="border rounded-lg p-4 bg-[var(--card-bg)] border-[var(--card-border)] shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-heading font-medium flex items-center text-white">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: goal.color }}
              ></span>
              {goal.title}
            </h4>
            <Link 
              href={`/goals/${goal._id.toString()}`} 
              className="text-sm font-body text-peach hover:underline"
            >
              Details
            </Link>
          </div>
          
          {error ? (
            <div className="text-red-500 text-xs py-1 font-body">Error: {error}</div>
          ) : (
            <>
              <div className="dashboard-heatmap">
                <CalendarHeatmap
                  startDate={startDate}
                  endDate={endDate}
                  values={progressData}
                  classForValue={getClassForValue}
                  tooltipDataAttrs={getTooltipDataAttrs}
                  showWeekdayLabels={true}
                  horizontal={true}
                  gutterSize={2}
                  showMonthLabels={true}
                  weekdayLabels={weekdayLabels}
                  transformDayElement={(element, value, index) => {
                    return element;
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-3 text-xs font-body">
                <div className="text-medium-gray">
                  {completedDays}/{daysInYear} days
                </div>
                <div className="font-medium" style={{ color: `var(--${completionPercentage > 50 ? 'peach' : 'medium-gray'})` }}>
                  {completionPercentage}%
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}