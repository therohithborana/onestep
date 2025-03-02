'use client';

import { useState, useEffect, useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { format, subDays, startOfYear, endOfYear } from 'date-fns';
import 'react-tooltip/dist/react-tooltip.css';

export default function GoalHeatmap({ goalId, onDateSelect }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom weekday labels
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Memoize the date calculations to prevent re-renders
  const { startDate, endDate } = useMemo(() => {
    return {
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date())
    };
  }, []); // Empty dependency array means this only runs once
  
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        console.log('GoalHeatmap: Fetching progress data for goal:', goalId);
        const response = await fetch(`/api/progress?goalId=${goalId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching progress data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('GoalHeatmap: Received progress data:', data.length, 'entries');
        
        // Transform the data for the heatmap
        const transformedData = data.map(entry => ({
          date: entry.date,
          count: entry.completed ? 1 : 0,
          notes: entry.notes || '',
        }));
        
        setProgressData(transformedData);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (goalId) {
      fetchProgressData();
    }
  }, [goalId]);
  
  // Function to generate tooltip content
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return null;
    }
    
    const date = new Date(value.date);
    const formattedDate = format(date, 'MMM d, yyyy');
    const status = value.count > 0 ? 'Completed' : 'Not completed';
    
    return {
      'data-tooltip-id': 'heatmap-tooltip',
      'data-tooltip-content': `${formattedDate}: ${status}${value.notes ? `\nNotes: ${value.notes}` : ''}`,
    };
  };
  
  // Function to determine the color class based on the value
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    return `color-scale-${value.count}`;
  };
  
  // Handle click on a day
  const handleDayClick = (value) => {
    if (value && value.date && onDateSelect) {
      console.log('GoalHeatmap: Day clicked:', value.date);
      onDateSelect(value.date, value.notes);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto mb-2.5"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
      </div>
    );
  }
  
  if (progressData.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>No progress data available yet.</p>
        <p className="text-sm mt-2">Start tracking your progress to see your heatmap.</p>
      </div>
    );
  }
  
  return (
    <div className="heatmap-container">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={progressData}
        classForValue={getClassForValue}
        tooltipDataAttrs={getTooltipDataAttrs}
        showWeekdayLabels={true}
        weekdayLabels={weekdayLabels}
        showMonthLabels={true}
        gutterSize={2}
        onClick={handleDayClick}
        transformDayElement={(element, value, index) => {
          return element;
        }}
      />
      <Tooltip id="heatmap-tooltip" />
    </div>
  );
} 