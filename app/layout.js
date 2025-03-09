import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Space_Mono, Space_Grotesk } from 'next/font/google';
import Navbar from '@/components/Navbar';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'OneStep - Ek kadam lakshya ki taraf',
 
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceMono.variable} ${spaceGrotesk.variable}`} data-theme="dark">
        <head>
          <link rel="icon" href="/paper-plane.svg" />
        </head>
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
} 
