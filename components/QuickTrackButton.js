'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickTrackButton({ goalId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleQuickTrack = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      
      // Fix for timezone issues - get today's date in local timezone
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      console.log('QuickTrackButton: Tracking progress for today:', today);
      
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          date: today,
          completed: true,
          notes: '',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track progress');
      }
      
      console.log('QuickTrackButton: Progress tracked successfully');
      setSuccess(true);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (err) {
      console.error('Error tracking progress:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleQuickTrack}
        disabled={isSubmitting || success}
        className={`btn ${success ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'}`}
      >
        {isSubmitting ? 'Saving...' : success ? '✓ Completed Today' : 'Mark as Completed Today'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
} 