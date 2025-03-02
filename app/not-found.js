import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-navy">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-6 text-peach">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-white">Page Not Found</h2>
        
        <div className="mb-8">
          <p className="text-medium-gray mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="w-16 h-1 bg-peach mx-auto"></div>
        </div>
        
        <Link 
          href="/" 
          className="btn btn-accent inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 