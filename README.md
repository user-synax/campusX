<div align="center">

<img src="https://img.shields.io/badge/CampusX-Student%20Social%20Platform-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMiAxMEgybTAgMGwxMC04IDEwIDhNNSAxMHY3YTIgMiAwIDAgMCAyIDJoMTBhMiAyIDAgMCAwIDItMnYtN00xMCAyMnYtNmEyIDIgMCAwIDEgNC0wdjYiLz48L3N2Zz4=" alt="CampusX" />

# CampusX

### The social platform built exclusively for Indian college students.

**Not LinkedIn. Not Instagram. Not WhatsApp groups.**  
A dedicated space where students connect, share, and grow — verified college identity only.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campus--x--rho.vercel.app-6366f1?style=flat-square)](https://campus-x-rho.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square&logo=pusher)](https://pusher.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

</div>

---

## What is CampusX?

Every Indian college student lives across 5 different platforms — WhatsApp for updates, Instagram for photos, LinkedIn for fake achievements, Telegram for notes, and Google Forms for events. None of them are built *for students*.

**CampusX** is a student-only social network where you need a verified college email to join. Real identity. Real campus community. No recruiters, no ads, no noise — just your college, your people, and your content.

> Currently targeting **IGNOU** and **DTU** for soft launch. Built by a solo developer in Delhi.

---

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CampusX                              │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Verify  │  │   Feed   │  │ Community│  │ Profile  │   │
│  │  Email   │→ │  Posts   │  │  Rooms   │  │ + Coins  │   │
│  │  + OTP   │  │  + Likes │  │  + Chat  │  │ + Badge  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       ↓              ↓              ↓              ↓        │
│  ✅ Verified    📰 Smart       💬 Realtime    🏆 Gamified   │
│  Identity      Algorithm      Messaging      Experience    │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 🎓 Student Verification
```
College Email → OTP Sent → Verified Badge ✓
```
Only real students get in. No fake accounts, no outsiders. Verified badge shows on every post and profile.

---

### 📰 Smart Feed Algorithm
Posts are ranked by a weighted score — not just chronological order:

```
Feed Score = (Likes × 1.5) + (Comments × 2) + (Views × 0.5)
           + Recency Boost + Connection Boost
```

Students see relevant content from their college first, trending content second.

---

### 💬 Real-time Features
- **Live notifications** — instant alerts for likes, comments, follows
- **Notification sound** — toggle on/off
- **Trending sidebar** — top posts updating live
- **View counts** — see how many students viewed your post

---

### 🏆 Campus Coins (Virtual Currency)
```
Post content        → Earn coins
Get likes           → Earn coins  
Daily login         → Earn coins
Redeem coins        → Unlock features
```
Gamified engagement that rewards quality contribution.

---

### 🛡️ Admin Moderation Panel
Full admin dashboard to manage content, users, and reports — keeping the campus feed clean and safe.

---

## Feature List

| Feature | Status |
|---|---|
| Student email verification + OTP | ✅ Live |
| Verified badge on profiles | ✅ Live |
| JWT auth with HTTP-only cookies | ✅ Live |
| Post feed with image upload | ✅ Live |
| Like, comment, share on posts | ✅ Live |
| View count per post | ✅ Live |
| Smart feed algorithm | ✅ Live |
| Real-time notifications (Pusher) | ✅ Live |
| Notification sound toggle | ✅ Live |
| Trending posts sidebar | ✅ Live |
| Community rooms | ✅ Live |
| Campus Coins system | ✅ Live |
| User profiles + account settings | ✅ Live |
| 3-dot post menu (edit/delete/report) | ✅ Live |
| Admin moderation panel | ✅ Live |
| Forgot password flow | ✅ Live |
| PWA (installable on Android) | ✅ Live |
| SEO optimized pages | ✅ Live |
| Mobile responsive | ✅ Live |
| Dark theme (#0f0f0f) | ✅ Live |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 App Router | SSR + API routes in one |
| Language | JavaScript (no TypeScript) | Fast iteration |
| Database | MongoDB + Mongoose | Flexible schema for social data |
| Auth | JWT + HTTP-only cookies | Secure, no session storage |
| Real-time | Pusher Channels | Managed WebSockets |
| File Upload | UploadThing | Simple image CDN |
| UI Components | shadcn/ui | Accessible, customizable |
| Styling | Tailwind CSS | Utility-first dark theme |
| Deployment | Vercel + Netlify | Dual deployment for reliability |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 15                        │
│                                                     │
│  ┌─────────────┐         ┌──────────────────────┐  │
│  │  App Router │         │    API Routes         │  │
│  │  (Frontend) │ ←────→  │  /api/posts           │  │
│  │             │         │  /api/auth             │  │
│  │  - Feed     │         │  /api/notifications    │  │
│  │  - Profile  │         │  /api/communities      │  │
│  │  - Explore  │         │  /api/coins            │  │
│  │  - Admin    │         └──────────┬─────────────┘  │
│  └─────────────┘                    │               │
└─────────────────────────────────────│───────────────┘
                                      │
              ┌───────────────────────┼──────────────┐
              │                       │              │
        ┌─────▼─────┐         ┌───────▼──────┐  ┌───▼──────┐
        │  MongoDB  │         │    Pusher     │  │UploadThing│
        │  Atlas    │         │  Channels     │  │   CDN    │
        └───────────┘         └──────────────┘  └──────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Pusher account (free tier)
- UploadThing account (free tier)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/campusx.git
cd campusx

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_super_secret_key

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# Start development server
npm run dev
```

Open `http://localhost:3000`

---

## Project Structure

```
campusx/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/          # OTP verification
│   ├── (main)/
│   │   ├── feed/            # Smart algorithm feed
│   │   ├── explore/         # Discover posts + users
│   │   ├── communities/     # Community rooms
│   │   ├── notifications/   # Real-time notifications
│   │   └── profile/[id]/    # User profiles
│   ├── admin/               # Moderation panel
│   └── api/                 # All API routes
│       ├── auth/
│       ├── posts/
│       ├── notifications/
│       ├── communities/
│       ├── coins/
│       └── uploadthing/
├── components/
│   ├── ui/                  # shadcn components
│   ├── feed/                # Feed specific components
│   ├── post/                # Post card, actions
│   └── shared/              # Navbar, sidebar, etc.
├── lib/
│   ├── db.js                # MongoDB connection
│   ├── auth.js              # JWT helpers
│   └── utils.js
└── models/                  # Mongoose schemas
    ├── User.js
    ├── Post.js
    ├── Community.js
    └── Notification.js
```

---

## Security

CampusX is built with security as a first principle:

- **HTTP-only cookies** — JWT tokens never accessible via JavaScript
- **College email verification** — OTP-based, blocks fake signups
- **Rate limiting** on auth routes — prevents brute force
- **Input sanitization** on all API routes
- **Admin-only routes** protected by role middleware
- **No sensitive data in client** — all secrets server-side only

---

## The Problem We're Solving

Indian college students have no dedicated digital home:

- **WhatsApp groups** — chaotic, no content discovery, admin-controlled
- **Instagram** — algorithm hides college content, not student-specific
- **LinkedIn** — professional pressure, no casual peer connection
- **Telegram** — anonymous, unsafe, no verified identity

CampusX gives students a **verified, safe, college-first** social space.

**Target market:** 40 million+ college students in India.  
**Initial focus:** IGNOU (4M students) and DTU, Delhi.

---

## Roadmap

- [ ] College-specific sub-feeds
- [ ] Anonymous confession board (verified but anonymous posts)
- [ ] Study group finder
- [ ] Campus events calendar
- [ ] Internship/placement board (student-to-student, not corporate)
- [ ] Notes and resource sharing
- [ ] Push notifications (Web Push API)
- [ ] iOS PWA improvements
- [ ] Multi-college expansion

---

## Deployment

Live on dual deployment for maximum reliability:

| Platform | URL | Status |
|---|---|---|
| Vercel (Primary) | campus-x-rho.vercel.app | ✅ Live |
| Netlify (Backup) | campus-x-rho.netlify.app | ✅ Live |

Both deployments pull from the same GitHub repo — if one goes down, the other handles traffic.

---

## Built By

> Solo project by **Ayush** — self-taught full stack developer, Delhi.  
> Built from scratch with no team, no funding, no college degree.  
> Every line of code, every design decision, every deployment — solo.

---

## Contributing

CampusX is in active development. If you're a student or developer who wants to contribute:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for every student who ever felt lost in college.**  
Give it a ⭐ if you believe every campus deserves its own digital home.

Made with 💜 in Delhi, India 🇮🇳

</div>
