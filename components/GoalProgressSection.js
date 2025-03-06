'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TodayProgressCard from './TodayProgressCard';
import GoalHeatmap from './GoalHeatmap';

export default function GoalProgressSection({ goalId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const searchParams = useSearchParams();
  
  // Update selectedDate when URL parameters change
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
    } else {
      setSelectedDate(null);
    }
  }, [searchParams]);

  const handleDateSelect = (date, notes) => {
    setSelectedDate(date);
    setSelectedNotes(notes);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <TodayProgressCard 
        goalId={goalId} 
        selectedDate={selectedDate} 
        selectedNotes={selectedNotes} 
      />
      <div className="card overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-bold font-heading text-peach mb-3 sm:mb-4">Progress Heatmap</h2>
        <div className="min-w-[600px]">
          <GoalHeatmap goalId={goalId} onDateSelect={handleDateSelect} />
        </div>
        <p className="text-xs text-medium-gray mt-3 italic">Scroll horizontally to view more dates if needed</p>
      </div>
    </div>
  );
} 