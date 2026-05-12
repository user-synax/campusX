# CampusZen Landing Page Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the CampusZen landing page into a modern, vibrant, and high-converting entry point for Indian college students using a "Bento-style" layout, improved Hinglish copy, and pSEO-friendly college search.

**Architecture:** 
- Modular landing page components in `components/landing/`.
- Enhanced UI components in `components/ui/` using Tailwind v4 and Framer Motion.
- Dynamic college search section for programmatic SEO hooks.
- Server-side stats fetching with fallback.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, Framer Motion, GSAP, Lucide React, shadcn/ui.

---

### Task 1: Design System & UI Components Refresh

**Files:**
- Modify: `components/ui/hero-section.jsx`
- Create: `components/ui/bento-grid.jsx`
- Create: `components/ui/vibrant-card.jsx`
- Modify: `tailwind.config.js` (Check if v4 needs any specific adjustments)

- [ ] **Step 1: Update Tailwind v4 theme for vibrant student-centric colors**
Add custom colors like `campus-blue`, `student-orange`, `zen-green` to the theme.

- [ ] **Step 2: Create a Bento Grid component for features**
```jsx
// components/ui/bento-grid.jsx
export const BentoGrid = ({ children, className }) => {
  return (
    <div className={cn("grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({ title, description, header, icon, className }) => {
  return (
    <div className={cn("row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4", className)}>
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">{title}</div>
        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">{description}</div>
      </div>
    </div>
  );
};
```

### Task 2: Copywriting & Content Update

**Files:**
- Modify: `components/landing/HeroSectionDemo.jsx`
- Modify: `components/landing/Features.jsx`

- [ ] **Step 1: Rewrite Hero Copy for better resonance**
**Headline:** "Padhai, Bakchodi, aur Networking — Sab ek jagah."
**Subheadline:** "The only exclusive network for your college. Access free resources, collaborate on code, and stay connected with your campus tribe."
**CTA:** "Join Your Tribe (Free)"

- [ ] **Step 2: Update Feature Copy**
- "Collab with real students" -> "Verified Campus Tribe"
- "Seprate Resources section" -> "The Ultimate Resource Vault"
- "Collaborative Code Area" -> "Code Together, Grow Together"

### Task 3: Implement Modern Hero Section

**Files:**
- Modify: `components/landing/Hero.jsx`
- Modify: `components/landing/HeroSectionDemo.jsx`

- [ ] **Step 1: Implement a "Floating UI" or "Mockup" in the Hero**
Use `components/ui/mockup.jsx` (if exists) or create a floating card effect showing a snippet of the feed or chat.

- [ ] **Step 2: Add GSAP entrance animations for text and visuals**

### Task 4: Bento Grid Features Section

**Files:**
- Modify: `components/landing/Features.jsx`

- [ ] **Step 1: Replace standard grid with BentoGrid**
Map existing features into `BentoGridItem` with custom headers (e.g., mini code editor mockup, chat bubbles).

### Task 5: Programmatic SEO College Search Section

**Files:**
- Create: `components/landing/CollegeSearch.jsx`
- Modify: `app/(public)/page.js`

- [ ] **Step 1: Create a search bar that "predicts" college names**
- [ ] **Step 2: Add "Popular Colleges" badges below the search bar**
- [ ] **Step 3: Link these to future programmatic pages `/community/[college-slug]`**

### Task 6: Final Polish & Responsive Check

**Files:**
- Modify: `app/globals.css`
- Modify: `components/landing/Footer.js`

- [ ] **Step 1: Ensure smooth transitions between sections**
- [ ] **Step 2: Mobile responsiveness audit for the new Bento grid**
- [ ] **Step 3: Update Footer with modern minimal links**

---
