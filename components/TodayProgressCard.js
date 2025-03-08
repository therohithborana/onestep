'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';

export default function TodayProgressCard({ goalId, selectedDate, selectedNotes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
  };
  
  // Get the current display date from URL or default to today
  const currentDate = selectedDate ? new Date(selectedDate) : new Date();
  const displayDate = selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'Today';
  
  // Fetch progress entry when date changes
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!goalId) return;
      
      const dateToFetch = selectedDate || getTodayDate();
      setLoading(true);
      
      try {
        const response = await fetch(`/api/progress?goalId=${goalId}&date=${dateToFetch}`);
        if (response.ok) {
          const data = await response.json();
          setTodayEntry(data && data.length > 0 ? data[0] : null);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setTodayEntry(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [goalId, selectedDate]);
  
  // Handle navigation between days
  const handlePreviousDay = () => {
    const previousDate = subDays(currentDate, 1);
    const formattedDate = format(previousDate, 'yyyy-MM-dd');
    router.replace(`/goals/${goalId}?date=${formattedDate}`, { scroll: false });
  };

  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1);
    const formattedDate = format(nextDate, 'yyyy-MM-dd');
    router.replace(`/goals/${goalId}?date=${formattedDate}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="card mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--accent)]">
            {displayDate === 'Today' ? "Today's Progress" : `Progress for ${displayDate}`}
          </h2>
        </div>
        <p className="text-text-secondary font-body mb-4 text-sm sm:text-base">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="card mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-5 rounded-full transition-colors"
              aria-label="Previous day"
            >
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--accent)]">
              {displayDate === 'Today' ? "Today's Progress" : `Progress for ${displayDate}`}
            </h2>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-[var(--accent)] hover:bg-opacity-5 rounded-full transition-colors"
              aria-label="Next day"
            >
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center">
          {todayEntry ? (
            <div className="flex items-center">
              {todayEntry.completed ? (
                <span className="text-green-500 font-body flex items-center text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="text-text-secondary font-body text-sm sm:text-base">Not completed</span>
              )}
            </div>
          ) : (
            <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="btn btn-primary font-body text-sm sm:text-base">
              Track Progress
            </Link>
          )}
        </div>
      </div>
      
      {todayEntry ? (
        <div>
          {todayEntry.notes ? (
            <div className="mb-4">
              <h3 className="text-text-primary font-body mb-2 font-medium text-sm sm:text-base">
                {displayDate === 'Today' ? "Today's Notes:" : `Notes for ${displayDate}:`}
              </h3>
              <div className="p-2 sm:p-3 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-text-primary font-body">
                <div 
                  className="prose prose-sm sm:prose max-w-none prose-invert"
                  dangerouslySetInnerHTML={{ __html: todayEntry.notes }}
                />
              </div>
            </div>
          ) : (
            <p className="text-text-secondary font-body mb-4 text-sm sm:text-base">
              No notes added for {displayDate === 'Today' ? 'today' : 'this day'}. 
              <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-[var(--accent)] hover:underline ml-1">
                Add notes
              </Link>
            </p>
          )}
          
          <div className="flex justify-end mt-4">
            <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-[var(--accent)] hover:underline font-body text-sm sm:text-base">
              Edit progress
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary font-body mb-4 text-sm sm:text-base">
          No progress tracked for {displayDate === 'Today' ? 'today' : 'this day'} yet. 
          <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-[var(--accent)] hover:underline ml-1">
            Track progress
          </Link>
        </p>
      )}
      
      {selectedDate && (
        <div className="flex justify-start mt-4">
          <button 
            onClick={() => router.push(`/goals/${goalId}`)}
            className="text-[var(--accent)] hover:underline font-body flex items-center text-sm sm:text-base"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to today
          </button>
        </div>
      )}
    </div>
  );
} 