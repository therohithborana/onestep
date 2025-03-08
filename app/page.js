'use client';

import { SignInButton, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Feature card component
const FeatureCard = ({ icon, title, onClick }) => (
  <div 
    className="feature-card group" 
    onClick={onClick}
  >
    <div className="flex items-center gap-3 text-text-secondary mb-2">
      {icon}
      <span className="text-sm text-text-secondary group-hover:text-[var(--accent)] transition-colors">
        {title}
      </span>
    </div>
  </div>
);

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-accent/20 rounded mb-4"></div>
          <div className="h-4 w-48 bg-accent/10 rounded"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Main Content */}
      <div className="max-w-4xl w-full text-center -mt-20">
        <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6 leading-tight">
          Track Your Goals
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-transparent bg-clip-text">
            OneStep at a time.
          </span>
        </h1>
        
        {/* <p className="text-xl text-secondary mb-12 font-mono">
          Enhance your education with OneStep's AI-Powered Education
        </p> */}

        {/* Feature Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <FeatureCard
            icon={<span className="text-blue-500">∫</span>}
            title="Learn Mathematics"
            onClick={() => {}}
          />
          <FeatureCard
            icon={<span className="text-red-500">⚛</span>}
            title="Master Physics"
            onClick={() => {}}
          />
          <FeatureCard
            icon={<span className="text-green-500">🧬</span>}
            title="Explore Biology"
            onClick={() => {}}
          />
        </div> */}

        {/* CTA Button */}
        <SignedOut>
          <SignInButton mode="modal" redirectUrl="/dashboard">
            <button className="btn btn-primary px-8 py-4 text-lg">
              Get Started
              <span className="ml-2">→</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center text-sm text-text-secondary">
        <a 
          href="https://x.com/therohithborana" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-[var(--accent)] transition-colors"
        >
          Built with 💜 by therohithborana
        </a>
      </footer>
    </main>
  );
} 
