# Requirements Document

## Introduction

The Admin Analytics Dashboard is a protected `/analytics` page within CampusX — a college social networking platform. It provides admins and the founder with a comprehensive, real-time view of platform health across all major domains: users, content, engagement, coins/economy, resources, group chats, events, moderation, and system activity. The dashboard aggregates data from all existing MongoDB models and exposes it through a secure, admin-only API endpoint. The UI is optimized for performance (aggregation-heavy queries are cached server-side), security (double-gated at route and API level), and usability (tabbed layout with charts, stat cards, and sortable tables).

---

## Glossary

- **Analytics_Dashboard**: The `/analytics` page accessible only to users with admin or founder privileges.
- **Analytics_API**: The `/api/admin/analytics` route handler that aggregates and returns platform metrics.
- **Admin**: A user whose `role` is `'admin'` or whose `username` matches the founder username, as determined by `isAdmin()` in `lib/admin.js`.
- **Stat_Card**: A UI component displaying a single numeric metric with a label and optional trend indicator.
- **Time_Range**: A selectable period (last 7 days, 30 days, 90 days, all time) used to scope time-series queries.
- **Engagement_Rate**: The ratio of total reactions + comments to total posts within a given Time_Range, expressed as a percentage.
- **Coin_Economy**: The aggregate state of CampusX's virtual currency, including total supply in circulation, transaction volume, and top earners/spenders.
- **Moderation_Queue**: The set of reported posts, pending resources, and active bans awaiting admin action.
- **Growth_Metric**: A numeric value compared against the same metric from the previous equivalent period to produce a percentage change.

---

## Requirements

### Requirement 1: Route-Level Access Control

**User Story:** As a platform admin, I want the `/analytics` page to be inaccessible to non-admins, so that sensitive platform data is never exposed to regular users.

#### Acceptance Criteria

1. WHEN a non-authenticated user navigates to `/analytics`, THE Analytics_Dashboard SHALL redirect the user to `/feed`.
2. WHEN an authenticated non-admin user navigates to `/analytics`, THE Analytics_Dashboard SHALL redirect the user to `/feed`.
3. WHEN an authenticated admin navigates to `/analytics`, THE Analytics_Dashboard SHALL render the dashboard content.
4. THE Analytics_Dashboard SHALL perform the admin check using the `isAdmin()` function from `lib/admin.js` on the current user returned by `useUser()`.

---

### Requirement 2: API-Level Access Control

**User Story:** As a platform admin, I want every analytics API endpoint to independently verify admin identity, so that direct API calls from non-admins are rejected even if the UI is bypassed.

#### Acceptance Criteria

1. WHEN a request reaches `/api/admin/analytics` without a valid `campusx_token` cookie, THE Analytics_API SHALL return HTTP 401.
2. WHEN a request reaches `/api/admin/analytics` with a valid token belonging to a non-admin user, THE Analytics_API SHALL return HTTP 403.
3. WHEN a request reaches `/api/admin/analytics` with a valid admin token, THE Analytics_API SHALL return HTTP 200 with the analytics payload.
4. THE Analytics_API SHALL call `getCurrentUser()` from `lib/auth.js` and `isAdmin()` from `lib/admin.js` on every request before executing any database query.

---

### Requirement 3: User Analytics

**User Story:** As an admin, I want to see user growth and demographic data, so that I can understand who is joining CampusX and how the user base is evolving.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of non-deleted users (`isDeleted: false`).
2. THE Analytics_API SHALL return the count of new users registered within the selected Time_Range.
3. THE Analytics_API SHALL return the Growth_Metric for new user registrations compared to the previous equivalent period.
4. THE Analytics_API SHALL return the count of currently banned users (`isBanned: true`).
5. THE Analytics_API SHALL return the count of verified users (`isVerified: true`).
6. THE Analytics_API SHALL return a breakdown of users grouped by `college`, limited to the top 10 colleges by user count.
7. THE Analytics_API SHALL return a time-series of new user registrations aggregated by day for the selected Time_Range.
8. THE Analytics_API SHALL return the count of users who have logged in (have `lastActiveDate` within the last 24 hours) as the Daily Active Users metric.
9. WHEN the Time_Range changes, THE Analytics_Dashboard SHALL re-fetch user analytics data from the Analytics_API.

---

### Requirement 4: Content Analytics

**User Story:** As an admin, I want to see post and comment activity metrics, so that I can gauge platform content health and detect unusual spikes or drops.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of non-deleted posts (`isDeleted: false`).
2. THE Analytics_API SHALL return the count of posts created within the selected Time_Range.
3. THE Analytics_API SHALL return the Growth_Metric for post creation compared to the previous equivalent period.
4. THE Analytics_API SHALL return the total count of comments within the selected Time_Range.
5. THE Analytics_API SHALL return the Engagement_Rate for the selected Time_Range.
6. THE Analytics_API SHALL return the count of anonymous posts within the selected Time_Range.
7. THE Analytics_API SHALL return the count of posts containing polls within the selected Time_Range.
8. THE Analytics_API SHALL return the count of posts containing images within the selected Time_Range.
9. THE Analytics_API SHALL return a time-series of post creation aggregated by day for the selected Time_Range.
10. THE Analytics_API SHALL return the top 5 most-used hashtags by post count within the selected Time_Range.
11. THE Analytics_API SHALL return the count of currently hidden posts (`isHidden: true, isDeleted: false`).
12. THE Analytics_API SHALL return the count of posts with `reportCount` greater than 0.

---

### Requirement 5: Coin Economy Analytics

**User Story:** As an admin, I want to monitor the virtual coin economy, so that I can detect abuse, balance the reward system, and understand spending patterns.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the sum of all `Wallet.balance` values as the total coins in circulation.
2. THE Analytics_API SHALL return the sum of all `Wallet.totalEarned` values as lifetime coins earned.
3. THE Analytics_API SHALL return the sum of all `Wallet.totalSpent` values as lifetime coins spent.
4. THE Analytics_API SHALL return the total coin transaction volume (sum of `CoinTransaction.amount`) within the selected Time_Range.
5. THE Analytics_API SHALL return a breakdown of transaction volume grouped by `CoinTransaction.reason` for the selected Time_Range.
6. THE Analytics_API SHALL return the top 5 users by `Wallet.totalEarned`, including their `username` and `totalEarned` value.
7. THE Analytics_API SHALL return the top 5 users by `Wallet.totalSpent`, including their `username` and `totalSpent` value.
8. THE Analytics_API SHALL return the count of `admin_adjust` transactions within the selected Time_Range.
9. THE Analytics_API SHALL return a time-series of total coin transaction volume aggregated by day for the selected Time_Range.

---

### Requirement 6: Resource Analytics

**User Story:** As an admin, I want to see resource upload and moderation metrics, so that I can track the academic content library's growth and review queue health.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of approved resources (`status: 'approved'`).
2. THE Analytics_API SHALL return the count of resources with `status: 'pending'`.
3. THE Analytics_API SHALL return the count of resources with `status: 'rejected'`.
4. THE Analytics_API SHALL return the count of resources uploaded within the selected Time_Range.
5. THE Analytics_API SHALL return the total sum of `Resource.downloadCount` across all approved resources.
6. THE Analytics_API SHALL return the total sum of `Resource.viewCount` across all approved resources.
7. THE Analytics_API SHALL return a breakdown of approved resources grouped by `category`.
8. THE Analytics_API SHALL return the top 5 most-downloaded resources, including `title`, `category`, and `downloadCount`.
9. THE Analytics_API SHALL return the count of resources with `copyrightFlag: true` that are still pending review.

---

### Requirement 7: Group Chat Analytics

**User Story:** As an admin, I want to see group chat activity metrics, so that I can understand community engagement and identify inactive or oversized groups.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of active group chats (`isActive: true`).
2. THE Analytics_API SHALL return the count of new group chats created within the selected Time_Range.
3. THE Analytics_API SHALL return the total sum of `GroupChat.messageCount` across all active groups as total messages sent.
4. THE Analytics_API SHALL return the average member count per active group chat.
5. THE Analytics_API SHALL return the top 5 most active groups by `messageCount`, including `name` and `messageCount`.
6. THE Analytics_API SHALL return the count of group chats created within the selected Time_Range.

---

### Requirement 8: Event Analytics

**User Story:** As an admin, I want to see event creation and RSVP metrics, so that I can understand campus event engagement across colleges.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of active events (`isActive: true`).
2. THE Analytics_API SHALL return the count of upcoming events (where `eventDate` is greater than the current timestamp).
3. THE Analytics_API SHALL return the count of past events (where `eventDate` is less than or equal to the current timestamp).
4. THE Analytics_API SHALL return the count of events created within the selected Time_Range.
5. THE Analytics_API SHALL return the total RSVP count across all active events (sum of `rsvps` array lengths).
6. THE Analytics_API SHALL return the top 5 events by RSVP count, including `title`, `college`, and RSVP count.
7. THE Analytics_API SHALL return a breakdown of events grouped by `college`, limited to the top 10 colleges by event count.

---

### Requirement 9: Moderation Analytics

**User Story:** As an admin, I want to see moderation activity and queue metrics, so that I can assess platform safety and admin workload.

#### Acceptance Criteria

1. THE Analytics_API SHALL return the total count of active user bans (from the `UserBan` model where `isActive: true`).
2. THE Analytics_API SHALL return the total count of active IP bans (from the `IPBan` model where `isActive: true`).
3. THE Analytics_API SHALL return the count of admin actions logged within the selected Time_Range.
4. THE Analytics_API SHALL return a breakdown of admin log entries grouped by `action` type for the selected Time_Range.
5. THE Analytics_API SHALL return the count of posts with `reportCount` greater than 0 and `isDeleted: false` as the active reports metric.
6. THE Analytics_API SHALL return the count of resources with `copyrightFlag: true` and `status: 'pending'` as the flagged resources metric.
7. THE Analytics_API SHALL return the top 3 admins by action count within the selected Time_Range, including `username` and action count.

---

### Requirement 10: Platform Overview Summary

**User Story:** As an admin, I want a single-screen overview of the most critical platform metrics, so that I can quickly assess platform health without navigating between tabs.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display a summary section containing at minimum: total users, total posts, coins in circulation, active bans, pending resources, and active group chats.
2. THE Analytics_Dashboard SHALL display each summary metric as a Stat_Card with a label, current value, and Growth_Metric percentage where applicable.
3. WHEN a Growth_Metric is positive, THE Analytics_Dashboard SHALL render the percentage in green.
4. WHEN a Growth_Metric is negative, THE Analytics_Dashboard SHALL render the percentage in red.
5. WHEN a Growth_Metric is zero, THE Analytics_Dashboard SHALL render the percentage in a neutral color.
6. THE Analytics_Dashboard SHALL display the timestamp of the last data fetch in the overview section.

---

### Requirement 11: Time Range Selection

**User Story:** As an admin, I want to filter all analytics by a time range, so that I can compare platform activity across different periods.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL provide a time range selector with options: Last 7 Days, Last 30 Days, Last 90 Days, and All Time.
2. WHEN a new Time_Range is selected, THE Analytics_Dashboard SHALL re-fetch all analytics data scoped to the new range.
3. THE Analytics_Dashboard SHALL default to the Last 30 Days time range on initial load.
4. WHEN the Time_Range is set to All Time, THE Analytics_API SHALL return metrics without any date filter on time-series queries.
5. THE Analytics_Dashboard SHALL display the selected Time_Range label alongside each chart title.

---

### Requirement 12: Data Visualization

**User Story:** As an admin, I want analytics data presented as charts and tables, so that I can identify trends and patterns at a glance.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL render time-series data (user registrations, post creation, coin volume) as line or bar charts.
2. THE Analytics_Dashboard SHALL render breakdown data (resources by category, transactions by reason, events by college) as bar charts or pie/donut charts.
3. THE Analytics_Dashboard SHALL render top-N lists (top resources, top groups, top earners) as ranked tables with at least two columns.
4. THE Analytics_Dashboard SHALL use Tailwind CSS v4 and Radix UI primitives consistent with the existing CampusX design system.
5. IF chart data is empty for the selected Time_Range, THEN THE Analytics_Dashboard SHALL display a "No data for this period" placeholder instead of an empty chart.

---

### Requirement 13: Performance and Caching

**User Story:** As an admin, I want the analytics page to load quickly without timing out, so that I can use it efficiently even as the platform scales.

#### Acceptance Criteria

1. THE Analytics_API SHALL execute all database aggregations for a single request in parallel using `Promise.all` where queries are independent.
2. THE Analytics_API SHALL respond within 5 seconds for datasets up to 100,000 documents per collection under normal Vercel serverless conditions.
3. THE Analytics_Dashboard SHALL display a loading skeleton while data is being fetched.
4. THE Analytics_Dashboard SHALL provide a manual refresh button that re-fetches all analytics data on demand.
5. IF the Analytics_API request fails, THEN THE Analytics_Dashboard SHALL display an error state with a retry button rather than a blank page.
6. THE Analytics_API SHALL use MongoDB aggregation pipelines with `$match` on indexed fields as the first stage to minimize collection scans.

---

### Requirement 14: Tabbed Navigation

**User Story:** As an admin, I want the analytics dashboard organized into tabs by domain, so that I can navigate to specific metric categories without scrolling through unrelated data.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL organize content into the following tabs: Overview, Users, Content, Economy, Resources, Chats, Events, Moderation.
2. THE Analytics_Dashboard SHALL use the existing Radix UI `Tabs` component consistent with the admin dashboard at `app/(main)/admin/page.js`.
3. WHEN a tab is selected, THE Analytics_Dashboard SHALL display only the metrics and charts relevant to that tab.
4. THE Analytics_Dashboard SHALL preserve the selected Time_Range when switching between tabs.
5. THE Analytics_Dashboard SHALL make the tab bar sticky so it remains visible while scrolling within a tab's content.
