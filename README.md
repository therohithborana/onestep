# OneStep - Goal Tracking Application

OneStep is a minimalist web application for tracking your daily goals with a beautiful heatmap visualization similar to GitHub/LeetCode contribution graphs.

## Features

- Google Sign-In with Clerk Authentication
- Personalized dashboard for each user
- Add and track multiple goals
- Daily progress tracking with notes
- Visual heatmap to monitor your consistency
- Clean, aesthetic design inspired by Medium.com

## Tech Stack

- Next.js (JavaScript)
- Clerk Authentication
- MongoDB (database)
- TailwindCSS (styling)
- React Calendar Heatmap

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_connection_string
``` 