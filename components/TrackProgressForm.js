'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackProgressForm({ goalId, initialDate }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Set the initial date properly, handling timezone issues
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    } else {
      // Get today's date in local timezone
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setDate(today);
    }
  }, [initialDate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('TrackProgressForm: Submitting progress for date:', date);
      
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          date,
          completed,
          notes,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track progress');
      }
      
      // Redirect back to the goal page
      router.push(`/goals/${goalId}`);
      router.refresh();
    } catch (err) {
      console.error('Error tracking progress:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="completed"
            name="completed"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="completed" className="ml-2 block text-sm text-neutral-700">
            Mark as completed
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="What did you learn today? Any challenges or insights?"
        ></textarea>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`/goals/${goalId}`)}
          className="btn btn-secondary mr-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </form>
  );
} 