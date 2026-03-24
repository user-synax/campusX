
# 📚 CampusX Documentation

## 🌟 Overview

CampusX is a modern, responsive social media platform designed specifically for college students. It enables users to share updates, join college-specific communities, follow peers, interact through likes and comments, and engage in gamified activities. Built with Next.js 16, it features real-time updates, anonymous posting, and a focus on student collaboration.

**Key Highlights:**
- **Target Audience**: College students for networking and community building.
- **Core Functionality**: Social feed, communities, events, profiles, and gamification.
- **Deployment**: Optimized for Vercel with analytics and performance insights.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.0 (App Router) – For server-side rendering, API routes, and routing.
- **UI Library**: React 19.2.4 – Component-based architecture.
- **Styling**: Tailwind CSS 4.2.2 – Utility-first CSS for responsive design.
- **Components**: Radix UI + Shadcn UI – Accessible, headless UI components.
- **Animations**: GSAP – Smooth, high-performance animations.
- **Icons**: Lucide React – Consistent iconography.
- **Notifications**: Sonner – Lightweight toast notifications.

### Backend & Infrastructure
- **Runtime**: Node.js (via Next.js API Routes) – Serverless backend.
- **Database**: MongoDB with Mongoose – NoSQL database for flexible data modeling.
- **Authentication**: JWT (using `jose`, `jsonwebtoken`, `bcryptjs`) – Secure token-based auth with HTTP-only cookies.
- **File Uploads**: Cloudinary + Uploadthing – Image hosting and optimization.
- **Real-time**: Pusher + Server-Sent Events (SSE) – Live notifications and updates.
- **Email**: Nodemailer – For notifications and communications.
- **Analytics**: Vercel Analytics & Speed Insights – Performance monitoring.
- **Other**: Dompurify (input sanitization), Date-fns (date handling), Cookie (secure cookie management).

## 📂 Folder Structure

The project follows a modular Next.js structure with clear separation of concerns:

```
campusx/
├── .env.local                 # Environment variables (local overrides)
├── .next/                     # Next.js build output (auto-generated)
├── app/                       # Next.js App Router
│   ├── (auth)/                # Auth route group (login/signup)
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── (main)/                # Main app route group
│   │   ├── admin/             # Admin dashboard
│   │   ├── bookmarks/         # Bookmarked posts
│   │   ├── chats/             # Group chats
│   │   ├── community/         # Community pages
│   │   ├── events/            # Event listings and details
│   │   ├── feed/              # Social feed
│   │   ├── hashtag/           # Hashtag-based post views
│   │   ├── leaderboard/       # XP and level rankings
│   │   ├── notifications/     # User notifications
│   │   ├── post/              # Individual post views
│   │   ├── profile/           # User profiles
│   │   ├── resources/         # Study resources
│   │   ├── search/            # Search interface
│   │   └── settings/          # User settings
│   ├── (public)/              # Public route group
│   │   └── page.js            # Home/landing page
│   ├── api/                   # API routes
│   │   ├── admin/             # Admin-specific endpoints
│   │   ├── auth/              # Authentication (login/signup)
│   │   ├── bookmarks/         # Bookmark management
│   │   ├── communities/       # Community operations
│   │   ├── events/            # Event CRUD
│   │   ├── follow/            # Follow/unfollow users
│   │   ├── founder/           # Founder features (broadcasts, roadmap)
│   │   ├── groups/            # Group chat management
│   │   ├── hashtags/          # Hashtag tracking
│   │   ├── health/            # Health checks
│   │   ├── leaderboard/       # XP/leaderboard data
│   │   ├── notifications/     # Notification handling
│   │   ├── posts/             # Post CRUD and interactions
│   │   ├── public/            # Public data access
│   │   ├── push/              # Push notifications
│   │   ├── pusher/            # Real-time Pusher integration
│   │   ├── resources/         # Resource management
│   │   ├── search/            # Search functionality
│   │   ├── test-api/          # Testing endpoints
│   │   ├── uploadthing/       # File upload handling
│   │   └── users/             # User profile operations
│   ├── globals.css            # Global styles
│   ├── layout.js              # Root layout
│   ├── page.module.css        # Home page styles
│   ├── error.js               # Error handling
│   ├── not-found.js           # 404 page
│   ├── robots.js              # SEO robots
│   └── sitemap.js             # SEO sitemap
├── components/                # Reusable UI components
│   ├── admin/                 # Admin-specific components
│   ├── chat/                  # Chat UI
│   ├── events/                # Event components
│   ├── founder/               # Founder features
│   ├── landing/               # Landing page components
│   ├── layout/                # Layout elements (header, sidebar)
│   ├── music/                 # Music-related (if any)
│   ├── notifications/         # Notification UI
│   ├── post/                  # Post components (feed, comments)
│   ├── resources/             # Resource display
│   ├── shared/                # Shared utilities
│   ├── ui/                    # Base UI (buttons, modals)
│   └── user/                  # User profile components
├── contexts/                  # React contexts for state
├── hooks/                     # Custom React hooks
├── lib/                       # Core utilities
├── models/                    # Mongoose schemas
│   ├── User.js                # User data model
│   ├── Post.js                # Post data model
│   ├── Comment.js             # Comment model
│   ├── Event.js               # Event model
│   ├── GroupChat.js           # Chat model
│   ├── GroupMessage.js        # Message model
│   ├── Hashtag.js             # Hashtag model
│   ├── Notification.js        # Notification model
│   ├── PushSubscription.js    # Push sub model
│   ├── Resource.js            # Resource model
│   └── AnonymousPost.js       # Anonymous post model
├── public/                    # Static assets (images, icons)
├── scripts/                   # Build/utility scripts
├── utils/                     # Helper functions
├── middleware.js              # Edge middleware for auth/protection
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
├── eslint.config.mjs          # ESLint config
├── jsconfig.json              # JavaScript config
├── package.json               # Dependencies and scripts
├── README.md                  # Basic project info
├── PROJECT_REPORT.md          # Detailed report (this complements docs)
├── CLAUDE.md                  # AI-generated notes
└── LICENSE                    # MIT License
```

## 🛤️ Routes

### Pages (Frontend Routes)
CampusX uses Next.js App Router with route groups for organization. Total pages: ~20+ (including dynamic routes).

- **Public Routes** (`(public)/`):
  - `/` (Home/Landing): Introduction and call-to-action.

- **Auth Routes** (`(auth)/`):
  - `/login`: User login form.
  - `/signup`: User registration form.

- **Main App Routes** (`(main)/`):
  - `/feed`: Social feed with posts, infinite scroll.
  - `/post/[id]`: Individual post view with comments.
  - `/profile/[username]`: User profile with posts and stats.
  - `/community/[id]`: College-specific community page.
  - `/events`: Event listings; `/events/[id]`: Event details.
  - `/search`: Global search for posts/users/hashtags.
  - `/hashtag/[tag]`: Posts filtered by hashtag.
  - `/bookmarks`: User's saved posts.
  - `/chats`: Group chat interface.
  - `/notifications`: Real-time notifications.
  - `/leaderboard`: XP and level rankings.
  - `/resources`: Study resources and links.
  - `/settings`: Account and preference settings.
  - `/admin`: Admin dashboard (restricted).

### API Endpoints (Backend Routes)
Total API routes: ~20+ folders, each with CRUD operations (GET, POST, PUT, DELETE).

- `/api/auth/*`: Login, signup, logout, token refresh.
- `/api/users/*`: Profile updates, follow/unfollow, user search.
- `/api/posts/*`: Create, read, update, delete posts; like/react/comment.
- `/api/communities/*`: Join/leave communities, community posts.
- `/api/events/*`: Create events, RSVP, event management.
- `/api/notifications/*`: Fetch/send notifications via SSE.
- `/api/search/*`: Query posts, users, hashtags.
- `/api/bookmarks/*`: Add/remove bookmarks.
- `/api/groups/*`: Create/manage group chats and messages.
- `/api/hashtags/*`: Trending hashtags and stats.
- `/api/leaderboard/*`: XP data and rankings.
- `/api/resources/*`: Upload/share study resources.
- `/api/founder/*`: Broadcasts, roadmap, analytics.
- `/api/admin/*`: Admin controls (user management, moderation).
- `/api/uploadthing/*`: File uploads (images).
- `/api/pusher/*`: Real-time event triggers.
- `/api/push/*`: Push notification subscriptions.
- `/api/public/*`: Public data (e.g., trending posts).
- `/api/health`: Server health check.
- `/api/test-api/*`: Development testing endpoints.

Each route includes validation, error handling, and rate limiting.

## ✨ Features

CampusX includes 15+ core features focused on social interaction and gamification:

1. **Authentication & Profiles**: Secure JWT-based login/signup; customizable profiles with avatars, bios, college details.
2. **Social Feed**: Dynamic posts with text, images (up to 4), polls, hashtags; anonymous posting; infinite scroll.
3. **Interactions**: Like, react (emojis), comment on posts; threaded discussions.
4. **Communities**: College-based groups for targeted sharing; auto-discovery via tags.
5. **Events**: Create/join events with RSVPs; integrated with posts.
6. **Follow System**: Follow/unfollow users; personalized feeds.
7. **Gamification (XP/Levels)**: Earn XP for actions (posting, liking); level up with rewards; real-time feedback.
8. **Search & Discovery**: Global search; trending hashtags; explore popular content.
9. **Bookmarks**: Save posts for later; personal library.
10. **Group Chats**: Real-time messaging in study groups or communities.
11. **Notifications**: Live alerts via SSE (likes, follows, comments, level-ups).
12. **Resources**: Share/upload study materials; collaborative learning.
13. **Founder Features**: Site-wide broadcasts; public roadmap; profile analytics.
14. **Admin Panel**: Moderate content, manage users, view metrics.
15. **Responsive Design**: Mobile-first UI with Tailwind; optimized for all devices.

## 🔒 Security Features

- **Authentication**: JWT tokens stored in HTTP-only cookies; bcrypt for password hashing; rate limiting on auth endpoints.
- **Input Sanitization**: Dompurify for user inputs; validation with Mongoose schemas.
- **Middleware Protection**: Edge middleware (`middleware.js`) for route guards; ID validation to prevent unauthorized access.
- **Data Privacy**: Anonymous posting option; secure cookie management.
- **Rate Limiting**: Prevents abuse on sensitive endpoints (e.g., login, posting).
- **Environment Security**: Sensitive data in `.env` files; no secrets in code.

## ⚡ Performance Features

- **Next.js Optimizations**: App Router for parallel data fetching; server-side rendering (SSR) and static generation.
- **Database Efficiency**: Mongoose `.lean()` queries for fast reads; indexed fields for quick searches.
- **Real-time Efficiency**: SSE instead of WebSockets for lightweight updates; Pusher for scalable real-time.
- **Image Optimization**: Cloudinary for compressed, responsive images; lazy loading.
- **Bundle Analysis**: `@next/bundle-analyzer` for monitoring build sizes.
- **Caching**: Next.js caching for API responses; Vercel CDN for static assets.
- **Analytics**: Vercel Speed Insights for performance tracking; GSAP for smooth animations without jank.
- **Scalability**: Serverless API routes; MongoDB for horizontal scaling.

---

This documentation provides a complete overview. For setup instructions, refer to your README.md. If you need updates or more details on specific sections, let me know! 🚀

--- 