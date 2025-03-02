'use client';

import { useState, useEffect, useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { format, subDays, startOfYear, endOfYear } from 'date-fns';

export default function GoalHeatmap({ goalId }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
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
        console.log('GoalHeatmap: Date range:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        const response = await fetch(
          `/api/progress?goalId=${goalId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        console.log('GoalHeatmap: API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('GoalHeatmap: API error response:', errorText);
          throw new Error(`Failed to fetch progress data: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('GoalHeatmap: Received data count:', data.length);
        
        // Transform data for the heatmap
        const formattedData = data.map(item => {
          // Ensure we're using the correct date by parsing it properly
          const dateObj = new Date(item.date);
          const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          
          return {
            date: formattedDate,
            count: item.completed ? 1 : 0,
            notes: item.notes || '',
          };
        });
        
        console.log('GoalHeatmap: Formatted data for heatmap, count:', formattedData.length);
        console.log('GoalHeatmap: Sample formatted data:', formattedData.slice(0, 2));
        
        setProgressData(formattedData);
        setDebugInfo({
          rawData: data,
          formattedData: formattedData
        });
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
        setDebugInfo({
          error: err.toString(),
          stack: err.stack
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (goalId) {
      console.log('GoalHeatmap: Effect triggered with goalId:', goalId);
      fetchProgressData();
    } else {
      console.error('GoalHeatmap: No goalId provided');
      setError('No goal ID provided');
      setLoading(false);
    }
  }, [goalId, startDate, endDate]); // Include date dependencies
  
  const getTooltipDataAttrs = (value) => {
    if (!value || !value.date) {
      return null;
    }
    
    const date = format(new Date(value.date), 'MMM d, yyyy');
    const status = value.count > 0 ? 'Completed' : 'Not completed';
    const notes = value.notes ? `Notes: ${value.notes}` : '';
    
    return {
      'data-tooltip-id': 'heatmap-tooltip',
      'data-tooltip-content': `${date}: ${status}${notes ? `\n${notes}` : ''}`,
    };
  };
  
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    return `color-scale-${value.count}`;
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading heatmap...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="text-left text-xs border p-2 rounded">
            <summary className="cursor-pointer">Debug Information</summary>
            <pre className="mt-2 overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
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
        transformDayElement={(element, value, index) => {
          return element;
        }}
      />
      <Tooltip id="heatmap-tooltip" />
      
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <details className="text-left text-xs border p-2 rounded mt-4">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
} 