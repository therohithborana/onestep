# OneStep - Track Your Goals

OneStep is a web application that helps you build consistency by tracking your daily progress toward your goals. With beautiful heatmap visualizations, you can see your progress at a glance and stay motivated.

![{E1869BC5-BD17-4DD7-BFF9-9D2AD6AACA76}](https://github.com/user-attachments/assets/3c3a28c3-8e64-496e-8d77-4c8697741913)

Try Now: https://onestep-azure.vercel.app/

## Features

- **Goal Tracking**: Create and manage your personal goals
- **Daily Progress**: Track your progress with a simple interface
- **Progress Notes**: Add detailed notes about your daily progress
- **Heatmap Visualization**: See your consistency at a glance with yearly heatmaps
- **Statistics**: View detailed statistics about your goal completion rates
- **Dark Theme**: Enjoy a beautiful dark-themed interface

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk

## Recent Updates

- Added inline notes editing in the Today's Progress section
- Implemented dark theme throughout the application
- Updated font settings with Montserrat for headings and improved typography
- Created a custom 404 page
- Enhanced UI components with better contrast and visual appeal

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with your Clerk and MongoDB credentials
4. Run the development server with `npm run dev`

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

## License

This project is licensed under the MIT License. 
