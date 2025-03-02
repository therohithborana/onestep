'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path ? 'text-peach' : 'text-white hover:text-peach';
  };
  
  return (
    <nav className="navbar shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-heading font-bold text-peach">
              OneStep
            </Link>
            
            <SignedIn>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link href="/dashboard" className={`font-body transition-colors ${isActive('/dashboard')}`}>
                  Dashboard
                </Link>
                <Link href="/goals" className={`font-body transition-colors ${isActive('/goals')}`}>
                  Goals
                </Link>
                <Link href="/stats" className={`font-body transition-colors ${isActive('/stats')}`}>
                  Statistics
                </Link>
              </div>
            </SignedIn>
          </div>
          
          <div className="flex items-center">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: '2.5rem',
                      height: '2.5rem'
                    }
                  }
                }}
              />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary font-body">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
} 