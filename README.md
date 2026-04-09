# 🚀 CampusX: The Ultimate Student Network

CampusX is a premium, high-performance social ecosystem built for the modern college student. It seamlessly blends social connectivity, real-time collaboration, and a deep gamification engine into a single, cohesive experience.

Built with **Next.js 16 (App Router)** and **React 19**, CampusX leverages a cutting-edge tech stack to deliver a "WOW" experience through smooth GSAP animations and instant micro-interactions.

---

## ✨ Features at a Glance

### 📱 Dynamic Social Feed
- **Rich Content Support**: Post text, multiple images (up to 6), hashtags, and native Polls.
- **Micro-Interactions**: Express yourself with 6 unique reactions (Fire, Wow, Respect, etc.) and deep threaded comments.
- **Privacy First**: Optional **Anonymous Posting** mode allows for open sharing without judgment.
- **Interactive Previews**: Dynamic Link Previews and full Markdown rendering support.

### 🎮 Gamification & Economy
- **Progression System**: Earn XP for every interaction—level up and show off your status on the global **Leaderboard**.
- **Stakes & Streaks**: Maintain active login streaks to earn bonus rewards.
- **Campus Wallet**: A built-in economy powered by **Campus Coins**.
- **Virtual Shop**: Purchase and equip digital items to customize your profile presence.
- **Achievements**: Unlock specialized badges for reaching major platform milestones.

### 🎓 Student Hub & Collaboration
- **Verified Status**: Dual-layered verification (Student Email or ID Card upload) ensures a safe, peer-to-peer community.
- **Collaborative Whiteboards**: Real-time canvas for brainstorming and quick sketches.
- **Study Rooms**: Dedicated virtual spaces for academic interaction.
- **Resource Sharing**: A centralized hub for exchanging notes and study materials.

### 📡 Real-time Infrastructure
- **SSE Notifications**: Instant, server-sent alerts for reactions, follows, and level-ups.
- **Web Push Branding**: Receive critical updates even when the app is closed.
- **Live Chats**: Integrated group and private messaging for seamless communication.

### 🛡️ Enterprise Security
- **Route Protection**: Edge-compatible Route Guard (`proxy.js`) with JWT session management.
- **Moderation Engine**: Site-wide broadcasts, automated IP/Email banning, and RBAC (Role-Based Access Control).

---

## 🚀 Tech Stack

- **Core**: Next.js 16 (App Router), React 19, MongoDB (Mongoose)
- **Styling**: Tailwind CSS v4, Framer Motion, GSAP (Animations)
- **Real-time**: Server-Sent Events (SSE), Pusher, Web Push API
- **Infrastructure**: Cloudinary (Media), Redis (Rate Limiting/Cache), Nodemailer (OTP Mailer)

---

## 📂 Project Structure

- `app/`: Next.js 16 architecture (optimized route groups).
- `components/`: Atomic UI components split by feature (post, event, layout, ui).
- `lib/`: Comprehensive core logic (Coins, XP, SSE, RBAC, etc.).
- `models/`: 20+ Mongoose schemas defining the complex data architecture.
- `proxy.js`: Root-level Edge-compatible security layer.

---

## 🛠️ Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
MONGODB_URI=...
JWT_SECRET=...
CLOUDINARY_URL=...
PUSHER_APP_ID=...
```

### 3. Launch
```bash
npm run dev
```

---

*Stay connected. Stay ahead. Welcome to CampusX.*
