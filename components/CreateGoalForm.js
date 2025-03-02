'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGoalForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const colorOptions = [
    { value: '#0ea5e9', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    
    try {
      console.log('CreateGoalForm: Starting form submission');
      setIsSubmitting(true);
      setError(null);
      setDebugInfo(null);
      
      const goalData = {
        title,
        description,
        color,
      };
      
      console.log('CreateGoalForm: Sending data to API:', goalData);
      
      // Add a try/catch specifically for the fetch operation
      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(goalData),
        });
        
        console.log('CreateGoalForm: API response status:', response.status);
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error('CreateGoalForm: API error response:', errorText);
          
          try {
            // Try to parse as JSON if possible
            const errorJson = JSON.parse(errorText);
            setDebugInfo({
              status: response.status,
              error: errorJson
            });
            throw new Error(errorJson.error || `Error: ${response.status}`);
          } catch (jsonError) {
            // If not valid JSON, use the text
            setDebugInfo({
              status: response.status,
              error: errorText
            });
            throw new Error(`Error: ${response.status} - ${errorText || 'Unknown error'}`);
          }
        }
        
        // If we get here, response is ok
        const responseData = await response.json();
        console.log('CreateGoalForm: API response data:', responseData);
        
        // Save debug info for display
        setDebugInfo({
          status: response.status,
          data: responseData
        });
        
        // Redirect to the new goal page
        console.log('CreateGoalForm: Goal created successfully, redirecting to:', `/goals/${responseData._id}`);
        
        // Add a small delay before redirecting to ensure state updates
        setTimeout(() => {
          router.push(`/goals/${responseData._id}`);
          router.refresh();
        }, 500);
        
      } catch (fetchError) {
        console.error('CreateGoalForm: Fetch error:', fetchError);
        setDebugInfo({
          fetchError: fetchError.toString(),
          stack: fetchError.stack
        });
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
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
          {isSubmitting ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}
 