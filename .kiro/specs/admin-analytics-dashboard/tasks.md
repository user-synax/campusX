# Implementation Plan: Admin Analytics Dashboard

## Overview

Build the `/analytics` admin-only page and `/api/admin/analytics` route for CampusX. Implementation proceeds in dependency order: pure helper functions first, then shared UI components, then the API route, then the page and tab sub-components, then tests.

## Tasks

- [x] 1. Create pure helper functions in `lib/analytics.js`
  - [x] 1.1 Implement `computeGrowth(current, previous)`
    - Returns `round((current - previous) / previous * 100)`; returns 100 when previous is 0 and current > 0; returns 0 when both are 0
    - _Requirements: 3.3, 4.3, 10.3, 10.4, 10.5_

  - [ ]* 1.2 Write property test for `computeGrowth` (Property 3, Property 9)
    - **Property 3: Growth metric calculation**
    - **Property 9: Growth metric color coding (input side)**
    - **Validates: Requirements 3.3, 4.3**
    - Use fast-check; minimum 100 runs; file: `__tests__/analytics/property/computeGrowth.test.js`

  - [x] 1.3 Implement `getGrowthColorClass(growth)`
    - Returns `'text-green-400'` for positive, `'text-red-400'` for negative, `'text-muted-foreground'` for zero
    - _Requirements: 10.3, 10.4, 10.5_

  - [ ]* 1.4 Write property test for `getGrowthColorClass` (Property 9)
    - **Property 9: Growth metric color coding**
    - **Validates: Requirements 10.3, 10.4, 10.5**
    - Use fast-check; file: `__tests__/analytics/property/colorClass.test.js`

  - [x] 1.5 Implement `applyDateFilter(range)` returning a MongoDB `createdAt` match object
    - Maps `'7d'` / `'30d'` / `'90d'` to `{ $gte: Date }`; `'all'` returns `{}`; invalid values default to `'30d'`
    - Also export `getRangeDuration(range)` returning milliseconds for growth period calculation
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ]* 1.6 Write property test for `applyDateFilter` (Property 8)
    - **Property 8: All Time range removes date filter**
    - **Validates: Requirements 11.4**
    - Use fast-check; file: `__tests__/analytics/property/dateFilter.test.js`

  - [x] 1.7 Implement `computeTopN(items, field, n)`
    - Sorts array of objects by `field` descending, returns first `n` entries; result length <= n; each entry's value >= any excluded entry's value
    - _Requirements: 5.6, 5.7, 6.8, 7.5, 8.6, 9.7_

  - [ ]* 1.8 Write property test for `computeTopN` (Property 6)
    - **Property 6: Top-N ranking accuracy**
    - **Validates: Requirements 5.6, 5.7, 6.8, 7.5, 8.6, 9.7**
    - Use fast-check; file: `__tests__/analytics/property/topN.test.js`

  - [x] 1.9 Implement `groupByField(items, field, limit)`
    - Groups array by `field`, counts per group, sorts descending, returns top `limit` as `[{ [field]: string, count: number }]`
    - _Requirements: 3.6, 4.10, 5.5, 6.7, 8.7, 9.4_

  - [ ]* 1.10 Write property test for `groupByField` (Property 7)
    - **Property 7: Grouping and breakdown accuracy**
    - **Validates: Requirements 3.6, 4.10, 5.5, 6.7, 8.7, 9.4**
    - Use fast-check; file: `__tests__/analytics/property/groupBy.test.js`

  - [x] 1.11 Implement `buildTimeSeries(docs, startDate, endDate)`
    - Accepts array of `{ date: string, count: number }` entries from aggregation, fills in zero-count days between startDate and endDate, returns sorted ascending array
    - _Requirements: 3.7, 4.9, 5.9_

  - [ ]* 1.12 Write property test for `buildTimeSeries` (Property 4)
    - **Property 4: Time-series daily aggregation**
    - **Validates: Requirements 3.7, 4.9, 5.9**
    - Use fast-check; file: `__tests__/analytics/property/timeSeries.test.js`

- [x] 2. Build shared analytics UI components
  - [x] 2.1 Create `components/analytics/StatCard.js`
    - Props: `{ title, value, growth, unit, icon }`
    - Renders growth badge using `getGrowthColorClass`; green up-arrow / red down-arrow / muted neutral based on sign
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [ ]* 2.2 Write unit test for StatCard growth badge rendering (Property 9)
    - **Property 9: Growth metric color coding**
    - **Validates: Requirements 10.3, 10.4, 10.5**
    - File: `__tests__/analytics/unit/ui.states.test.js`

  - [x] 2.3 Create `components/analytics/BarChart.js`
    - Props: `{ data: [{label, value}], title, rangeLabel, height? }`
    - Pure CSS flex layout — `flex items-end` container, bar height proportional to max value, no external chart library
    - Renders "No data for this period" placeholder when `data` is empty or all values are zero
    - _Requirements: 12.1, 12.4, 12.5_

  - [x] 2.4 Create `components/analytics/DonutChart.js`
    - Props: `{ data: [{label, value, color}], title }`
    - SVG donut using `stroke-dasharray` / `stroke-dashoffset` on `<circle>` elements; legend rendered as flex list below
    - Renders "No data for this period" placeholder when `data` is empty
    - _Requirements: 12.2, 12.4, 12.5_

  - [x] 2.5 Create `components/analytics/RankedTable.js`
    - Props: `{ columns: [{key, label}], rows: object[], title }`
    - Prepends rank column automatically; renders "No data for this period" when `rows` is empty
    - _Requirements: 12.3, 12.4, 12.5_

  - [x] 2.6 Create `components/analytics/AnalyticsSkeleton.js`
    - `animate-pulse` skeleton mirroring the overview tab layout (stat card grid + chart placeholders)
    - _Requirements: 13.3_

- [x] 3. Implement `/api/admin/analytics` route handler
  - [x] 3.1 Create `app/api/admin/analytics/route.js` with auth guard
    - Call `getCurrentUser(request)` then return 401 if null; call `isAdmin()` then return 403 if false; call `connectDB()`
    - Parse and validate `range` query param (`7d` | `30d` | `90d` | `all`); default to `30d`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Implement user aggregations section
    - `total`: `User.countDocuments({ isDeleted: false })`
    - `newInRange` + `growth` vs previous period using `getRangeDuration` and `computeGrowth`
    - `banned`: `User.countDocuments({ isBanned: true })`; `verified`: `User.countDocuments({ isVerified: true })`
    - `dau`: count where `lastActiveDate >= now - 24h`
    - `byCollege`: aggregate group by `college`, sort desc, limit 10
    - `timeSeries`: aggregate by day for range, pass through `buildTimeSeries`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.3 Implement content aggregations section
    - `totalPosts`: `Post.countDocuments({ isDeleted: false })`; `postsInRange` + `postGrowth`
    - `commentsInRange` via Comment model countDocuments within range
    - `engagementRate`: `(reactions + comments) / posts * 100` rounded to 1 decimal
    - `anonymousPosts` (`isAnonymous: true`), `pollPosts` (`poll.options.0` exists), `imagePosts` (`images.0` exists) — all scoped to range
    - `hiddenPosts`: `{ isHidden: true, isDeleted: false }`; `reportedPosts`: `{ reportCount: { $gt: 0 }, isDeleted: false }`
    - `topHashtags`: aggregate unwind `hashtags`, group, sort desc, limit 5
    - `timeSeries`: posts by day for range
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

  - [x] 3.4 Implement coin economy aggregations section
    - `totalCirculation`, `lifetimeEarned`, `lifetimeSpent`: single `Wallet.aggregate` with `$group { _id: null }`
    - `volumeInRange`: `CoinTransaction.aggregate` sum of `amount` within range
    - `adminAdjustCount`: count where `type: 'admin_adjust'` in range
    - `byReason`: aggregate group by `reason` in range, sort desc
    - `topEarners` / `topSpenders`: `Wallet.aggregate` sort + limit 5 + `$lookup` users for username
    - `timeSeries`: coin volume by day for range
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 3.5 Implement resource aggregations section
    - `approved`, `pending`, `rejected`: three `countDocuments` calls by `status`
    - `uploadedInRange`: count where `createdAt` in range
    - `totalDownloads`, `totalViews`: aggregate sum over `status: 'approved'` docs
    - `byCategory`: aggregate group by `category` where `status: 'approved'`
    - `topDownloaded`: sort by `downloadCount` desc, limit 5, project `title category downloadCount`
    - `copyrightFlagged`: `Resource.countDocuments({ copyrightFlag: true, status: 'pending' })`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 3.6 Implement group chat aggregations section
    - `activeGroups`: `GroupChat.countDocuments({ isActive: true })`
    - `newInRange`: count where `createdAt` in range and `isActive: true`
    - `totalMessages`: aggregate sum of `messageCount` where `isActive: true`
    - `avgMemberCount`: aggregate `$avg` of `{ $size: '$members' }` where `isActive: true`
    - `topGroups`: sort by `messageCount` desc, limit 5, project `name messageCount`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 3.7 Implement event aggregations section
    - `active`: `Event.countDocuments({ isActive: true })`
    - `upcoming`: count where `eventDate > now` and `isActive: true`; `past`: count where `eventDate <= now` and `isActive: true`
    - `createdInRange`: count where `createdAt` in range
    - `totalRsvps`: aggregate `$sum` of `{ $size: '$rsvps' }` where `isActive: true`
    - `topEvents`: aggregate `$project rsvpCount: { $size: '$rsvps' }`, sort desc, limit 5, project `title college rsvpCount`
    - `byCollege`: aggregate group by `college`, sort desc, limit 10
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 3.8 Implement moderation aggregations section
    - `activeUserBans`: `UserBan.countDocuments({ isActive: true })`; `activeIpBans`: `IPBan.countDocuments({ isActive: true })`
    - `actionsInRange`: `AdminLog.countDocuments({ createdAt: dateFilter })`
    - `byAction`: aggregate group by `action` in range, sort desc
    - `activeReports`: `Post.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false })`
    - `flaggedResources`: `Resource.countDocuments({ copyrightFlag: true, status: 'pending' })`
    - `topAdmins`: aggregate group by `adminId` in range, sort desc, limit 3, `$lookup` users for username
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 3.9 Wire all 7 sections into `Promise.all` and return response
    - Run all section aggregation functions in parallel; return `{ fetchedAt, range, users, content, coins, resources, chats, events, moderation }`
    - Wrap in try/catch; return 500 on any failure
    - _Requirements: 13.1, 13.2, 13.6_

  - [ ]* 3.10 Write unit and property tests for API (Properties 1, 2, 5)
    - Unit: 401 with no cookie, 403 with non-admin token, 200 with valid admin token and correct payload shape
    - Property tests using `mongodb-memory-server` with randomly generated seed data
    - **Property 1: Filtered count accuracy** — **Validates: Requirements 3.1, 3.4, 3.5, 6.1, 6.2, 6.3, 7.1, 8.1, 9.1, 9.2**
    - **Property 2: Time-range scoping accuracy** — **Validates: Requirements 3.2, 4.2, 5.8, 6.4, 7.2, 8.4, 9.3**
    - **Property 5: Sum aggregation accuracy** — **Validates: Requirements 5.1, 5.2, 5.3, 6.5, 6.6**
    - Files: `__tests__/analytics/unit/api.auth.test.js` and `__tests__/analytics/property/aggregations.test.js`

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create the `/analytics` page with admin guard and layout
  - [x] 5.1 Create `app/(main)/analytics/page.js` with route-level admin guard
    - `"use client"` — use `useUser()` + `isAdmin()` in `useEffect`; redirect to `/feed` if not admin or not authenticated
    - Show `AnalyticsSkeleton` while `userLoading` is true
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 5.2 Write unit tests for route guard redirects
    - Test redirect for unauthenticated user, redirect for non-admin, render for admin
    - File: `__tests__/analytics/unit/route.guard.test.js`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 5.3 Add time range selector and data-fetch logic to page
    - State: `range` (default `'30d'`), `data`, `loading`, `error`, `lastFetched`
    - `fetchAnalytics(range)` calls `/api/admin/analytics?range={range}`, sets state
    - `useEffect` triggers fetch on mount and on `range` change
    - Render `TimeRangeSelector` controlled select with options: Last 7 Days, Last 30 Days, Last 90 Days, All Time
    - Render refresh button showing `lastFetched` timestamp
    - _Requirements: 11.1, 11.2, 11.3, 13.4, 10.6_

  - [x] 5.4 Add Radix UI Tabs shell with sticky tab bar and error/loading states
    - Tabs: Overview | Users | Content | Economy | Resources | Chats | Events | Moderation
    - Tab bar sticky at `top-[57px]` with `z-10`, matching `app/(main)/admin/page.js` pattern
    - Show `AnalyticsSkeleton` while `loading`; show error state with retry button on `error`
    - _Requirements: 14.1, 14.2, 14.3, 14.5, 13.3, 13.5_

  - [ ]* 5.5 Write unit tests for time range selector and tab behavior
    - Test default range is `30d` on mount; changing range triggers re-fetch; tab switch preserves range
    - **Property 10: Tab time range preservation** — **Validates: Requirements 14.4**
    - File: `__tests__/analytics/unit/ui.states.test.js`
    - _Requirements: 11.2, 11.3, 14.4_

- [x] 6. Implement the 8 tab sub-components
  - [x] 6.1 Implement `OverviewTab`
    - 6 StatCards: total users (with growth), total posts (with growth), coins in circulation, active bans, pending resources, active group chats
    - Display `lastFetched` timestamp below the stat grid
    - _Requirements: 10.1, 10.2, 10.6_

  - [x] 6.2 Implement `UsersTab`
    - StatCards: total users, new in range (with growth), banned, verified, DAU
    - BarChart: registrations by day (time series), title includes range label
    - RankedTable: top 10 colleges by user count (`college`, `count` columns)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 12.1, 12.3, 14.5_

  - [x] 6.3 Implement `ContentTab`
    - StatCards: total posts, posts in range (with growth), comments in range, engagement rate, hidden posts, reported posts
    - BarChart: posts by day
    - RankedTable: top 5 hashtags (`tag`, `count` columns)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 12.1, 12.3_

  - [x] 6.4 Implement `EconomyTab`
    - StatCards: total circulation, lifetime earned, lifetime spent, volume in range, admin adjustments
    - BarChart: coin volume by day
    - DonutChart: transaction volume by reason
    - RankedTable: top 5 earners (`username`, `totalEarned`); top 5 spenders (`username`, `totalSpent`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 12.1, 12.2, 12.3_

  - [x] 6.5 Implement `ResourcesTab`
    - StatCards: approved, pending, rejected, uploaded in range, total downloads, total views, copyright flagged
    - DonutChart: resources by category
    - RankedTable: top 5 downloaded (`title`, `category`, `downloadCount`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 12.2, 12.3_

  - [x] 6.6 Implement `ChatsTab`
    - StatCards: active groups, new in range, total messages, avg member count
    - RankedTable: top 5 groups by message count (`name`, `messageCount`)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 12.3_

  - [x] 6.7 Implement `EventsTab`
    - StatCards: active events, upcoming, past, created in range, total RSVPs
    - BarChart or DonutChart: events by college (top 10)
    - RankedTable: top 5 events by RSVP count (`title`, `college`, `rsvpCount`)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 12.2, 12.3_

  - [x] 6.8 Implement `ModerationTab`
    - StatCards: active user bans, active IP bans, actions in range, active reports, flagged resources
    - DonutChart: admin actions by type
    - RankedTable: top 3 admins by action count (`username`, `actionCount`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 12.2, 12.3_

  - [ ]* 6.9 Write unit tests for tab rendering and empty/loading/error states
    - Test: overview renders 6 stat cards; all 8 tabs render with correct labels; empty data shows "No data for this period" placeholder; error state shows retry button; loading shows skeleton
    - File: `__tests__/analytics/unit/ui.states.test.js`
    - _Requirements: 12.5, 13.3, 13.5, 14.1_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with minimum 100 iterations per property
- Properties 1, 2, 5 require `mongodb-memory-server` for in-process aggregation testing
- All 7 API section aggregations run in `Promise.all` — implement them as separate async functions before wiring in task 3.9
- The `Comment` model is referenced in task 3.3 — verify the model name/path before implementing

