import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="home-page min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl sm:text-6xl font-display font-bold mb-6 text-peach">OneStep</h1>
        <p className="text-xl sm:text-2xl mb-8 text-white font-body">
          Track your goals, one step at a time.
        </p>

       <p>
          Made with Jalebi&apos;s sweetness by{' '}
          <a
            href="https://www.linkedin.com/in/rohith-borana-b10778266/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline text-yellow-500"
          >
            Rohith Borana
          </a>
        </p>
        <div className="prose max-w-2xl mx-auto mb-10 text-left font-body">
         
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="btn btn-primary text-lg px-8 py-3 font-body"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary text-lg px-8 py-3 font-body">
                Sign In
              </button>
            </SignInButton>
            
            
          </SignedOut>
        </div>
        
       
      </div>
    </main>
  );
} 
