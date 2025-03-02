import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import CreateGoalForm from '@/components/CreateGoalForm';

export default async function NewGoal() {
  const user = await currentUser();
  
  if (!user) {
    return null; // This should be handled by Clerk middleware
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">Create New Goal</h1>
      </div>
      
      <div className="card max-w-2xl mx-auto">
        <CreateGoalForm />
      </div>
    </main>
  );
} 