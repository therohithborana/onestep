'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditGoalForm({ goalId, initialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || '#0ea5e9');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const colorOptions = [
    { value: '#0ea5e9', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
  ];
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setColor(initialData.color || '#0ea5e9');
    }
  }, [initialData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    
    try {
      console.log('EditGoalForm: Starting form submission');
      setIsSubmitting(true);
      setError(null);
      setDebugInfo(null);
      
      const goalData = {
        title,
        description,
        color,
      };
      
      console.log('EditGoalForm: Sending data to API:', goalData);
      
      // Add a try/catch specifically for the fetch operation
      try {
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(goalData),
        });
        
        console.log('EditGoalForm: Received response:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('EditGoalForm: API error:', errorData);
          
          setDebugInfo({
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          
          throw new Error(errorData.error || 'Failed to update goal');
        }
        
        const responseData = await response.json();
        console.log('EditGoalForm: Goal updated successfully:', responseData);
        
        // Redirect to the goal page
        console.log('EditGoalForm: Goal updated successfully, redirecting to:', `/goals/${goalId}`);
        
        // Add a small delay before redirecting to ensure state updates
        setTimeout(() => {
          router.push(`/goals/${goalId}`);
          router.refresh();
        }, 500);
        
      } catch (fetchError) {
        console.error('EditGoalForm: Fetch error:', fetchError);
        setDebugInfo({
          fetchError: fetchError.toString(),
          stack: fetchError.stack
        });
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      console.log('EditGoalForm: Starting goal deletion');
      setIsDeleting(true);
      setError(null);
      setDebugInfo(null);
      
      try {
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'DELETE',
        });
        
        console.log('EditGoalForm: Received delete response:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('EditGoalForm: API delete error:', errorData);
          
          setDebugInfo({
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          
          throw new Error(errorData.error || 'Failed to delete goal');
        }
        
        console.log('EditGoalForm: Goal deleted successfully');
        
        // Redirect to the dashboard
        console.log('EditGoalForm: Redirecting to dashboard');
        
        // Add a small delay before redirecting to ensure state updates
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 500);
        
      } catch (fetchError) {
        console.error('EditGoalForm: Delete fetch error:', fetchError);
        setDebugInfo({
          fetchError: fetchError.toString(),
          stack: fetchError.stack
        });
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Debug Info:</p>
          <pre className="text-xs mt-2 overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
          Goal Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Learn Spanish, Exercise Daily"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Why is this goal important to you?"
        ></textarea>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Color
        </label>
        <div className="flex space-x-2">
          {colorOptions.map((option) => (
            <div 
              key={option.value}
              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                color === option.value ? 'border-neutral-800' : 'border-transparent hover:border-neutral-400'
              }`}
              style={{ backgroundColor: option.value }}
              onClick={() => setColor(option.value)}
              title={option.label}
            ></div>
          ))}
        </div>
      </div>
      
      {showDeleteConfirm ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold mb-2">Are you sure you want to delete this goal?</p>
          <p className="mb-4">This action cannot be undone. All progress data for this goal will also be deleted.</p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-md text-neutral-800"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Goal'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between mb-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800 font-medium"
            disabled={isSubmitting || isDeleting}
          >
            Delete Goal
          </button>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`/goals/${goalId}`)}
          className="btn btn-secondary mr-2"
          disabled={isSubmitting || isDeleting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || isDeleting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 