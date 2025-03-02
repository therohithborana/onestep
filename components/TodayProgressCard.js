'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TodayProgressCard({ goalId, selectedDate, selectedNotes }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState(null);
  const [displayDate, setDisplayDate] = useState(null);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  
  // Use selected date or today's date
  const today = getTodayDate();
  const dateToFetch = selectedDate || today;
  
  // Format the display date
  useEffect(() => {
    if (selectedDate) {
      // If it's a string, convert to Date object
      const dateObj = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
      setDisplayDate(format(dateObj, 'MMMM d, yyyy'));
    } else {
      setDisplayDate('Today');
    }
  }, [selectedDate]);
  
  // Fetch progress entry for the selected date or today
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/progress?goalId=${goalId}&date=${dateToFetch}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Progress data for', dateToFetch, ':', data);
          
          // Check if there's an entry for the date
          if (data && data.length > 0) {
            const entry = data[0];
            setTodayEntry(entry);
          } else {
            setTodayEntry(null);
          }
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // If we have selectedNotes directly passed (from heatmap click), use that
    if (selectedDate && selectedNotes !== undefined) {
      setTodayEntry({
        date: selectedDate,
        notes: selectedNotes,
        completed: true // Assume completed if we have notes
      });
      setLoading(false);
    } else {
      fetchProgressData();
    }
  }, [goalId, dateToFetch, selectedDate, selectedNotes]);
  
  if (loading) {
    return (
      <div className="card mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-peach">
            {displayDate === 'Today' ? "Today's Progress" : `Progress for ${displayDate}`}
          </h2>
        </div>
        <p className="text-medium-gray font-body mb-4 text-sm sm:text-base">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="card mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold font-heading text-peach">
          {displayDate === 'Today' ? "Today's Progress" : `Progress for ${displayDate}`}
        </h2>
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
                <span className="text-medium-gray font-body text-sm sm:text-base">Not completed</span>
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
              <h3 className="text-white font-body mb-2 font-medium text-sm sm:text-base">
                {displayDate === 'Today' ? "Today's Notes:" : `Notes for ${displayDate}:`}
              </h3>
              <div className="p-2 sm:p-3 border border-gray-700 rounded-lg bg-navy text-white font-body">
                {todayEntry.notes.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 text-sm sm:text-base">{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-medium-gray font-body mb-4 text-sm sm:text-base">
              No notes added for {displayDate === 'Today' ? 'today' : 'this day'}. 
              <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-peach hover:underline ml-1">
                Add notes
              </Link>
            </p>
          )}
          
          <div className="flex justify-end mt-4">
            <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-peach hover:underline font-body text-sm sm:text-base">
              Edit progress
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-medium-gray font-body mb-4 text-sm sm:text-base">
          No progress tracked for {displayDate === 'Today' ? 'today' : 'this day'} yet. 
          <Link href={`/goals/${goalId}/track${selectedDate ? `?date=${selectedDate}` : ''}`} className="text-peach hover:underline ml-1">
            Track progress
          </Link>
        </p>
      )}
      
      {selectedDate && (
        <div className="flex justify-start mt-4">
          <button 
            onClick={() => router.refresh()}
            className="text-peach hover:underline font-body flex items-center text-sm sm:text-base"
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