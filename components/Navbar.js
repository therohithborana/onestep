'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return pathname === path ? 'text-peach' : 'text-white hover:text-peach';
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
              </div>
            </SignedIn>
          </div>
          
          <div className="flex items-center">
            <SignedIn>
              {/* Mobile menu button */}
              <button 
                className="md:hidden mr-4 text-white focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  )}
                </svg>
              </button>
              
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
        
        {/* Mobile menu */}
        <SignedIn>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/dashboard" 
                  className={`font-body transition-colors px-2 py-1 ${isActive('/dashboard')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/goals" 
                  className={`font-body transition-colors px-2 py-1 ${isActive('/goals')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Goals
                </Link>
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </nav>
  );
} 