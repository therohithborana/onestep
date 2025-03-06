'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';

export default function TrackProgressForm({ goalId, initialDate }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const [date, setDate] = useState('');
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Fetch existing progress data when the date changes
  useEffect(() => {
    const fetchExistingProgress = async () => {
      if (!date || !goalId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/progress?goalId=${goalId}&date=${date}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Existing progress data:', data);
          
          if (data && data.length > 0) {
            const entry = data[0];
            setCompleted(entry.completed);
            setNotes(entry.notes || '');
            console.log('Loaded existing progress:', entry);
          } else {
            // No existing entry for this date, reset form
            setCompleted(true);
            setNotes('');
          }
        }
      } catch (err) {
        console.error('Error fetching existing progress:', err);
        setError('Failed to load existing progress data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingProgress();
  }, [goalId, date]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get content from TinyMCE editor
      const editorContent = editorRef.current ? editorRef.current.getContent() : notes;
      
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
          notes: editorContent,
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
    <form onSubmit={handleSubmit} className="text-sm sm:text-base">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm">
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
          className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-3 sm:py-4 text-neutral-500 text-sm sm:text-base">
          <p>Loading progress data...</p>
        </div>
      ) : (
        <>
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
              <label htmlFor="completed" className="ml-2 block text-sm sm:text-base text-neutral-700">
                Mark as completed
              </label>
            </div>
          </div>
          
          <div className="mb-5 sm:mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <Editor
              apiKey="fk5lvec7zyknaoe8bpuk01jmeqh0qhcuy8ulh0gf2oog0bmu"
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={notes}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'checklist'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist checklist outdent indent | ' +
                  'removeformat | fontsize | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                skin: 'oxide-dark',
                content_css: 'dark',
                placeholder: 'What did you learn today? Any challenges or insights?'
              }}
            />
          </div>
        </>
      )}
      
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => router.push(`/goals/${goalId}`)}
          className="btn btn-secondary w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </form>
  );
} 