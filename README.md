# CampusX - Student Social Media Platform

CampusX is a modern, responsive social media platform designed specifically for college students. It allows students to share updates, join college-specific communities, follow peers, and interact through likes and comments.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (HTTP-only cookies) with Edge Middleware protection
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Notifications**: Sonner

## ✨ Features

- **Authentication**: Secure signup and login with hashed passwords.
- **Dynamic Feed**: Real-time posts with support for anonymous posting.
- **College Communities**: Automatic community discovery based on college tags.
- **Interactions**: Like posts and comment on updates.
- **Profile System**: Customizable user profiles with bio, college, and course details.
- **Follow System**: Follow other students to see their updates.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Security**: Rate limiting on login, input sanitization, and ID validation.
- **Performance**: Parallel data fetching and database query optimizations (`.lean()`).

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### 1. Clone the repository
```bash
git clone <repository-url>
cd campusx
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Folder Structure Summary

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (layout, post, shared, user).
- `hooks/`: Custom React hooks for data fetching and state management.
- `lib/`: Core utilities (database connection, authentication helpers).
- `models/`: Mongoose schemas for User, Post, and Comment.
- `public/`: Static assets.
- `utils/`: Helper functions for formatting and validation.
- `middleware.js`: Edge-compatible route protection.

## 📝 License
MIT
