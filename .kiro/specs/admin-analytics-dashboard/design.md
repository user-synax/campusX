# Design Document: Admin Analytics Dashboard

## Overview

The Admin Analytics Dashboard is a protected `/analytics` page that gives CampusX admins a comprehensive, real-time view of platform health. It aggregates data from all major MongoDB collections (User, Post, Comment, Wallet, CoinTransaction, Resource, GroupChat, Event, UserBan, IPBan, AdminLog) through a single `/api/admin/analytics` endpoint that accepts a `range` query parameter.

The design prioritizes:
- **Security**: Double-gated at route and API level using existing `isAdmin()` / `getCurrentUser()` patterns
- **Performance**: All independent aggregations run in parallel via `Promise.all`; `$match` on indexed fields is always the first pipeline stage
- **Compatibility**: No new charting library — charts are built with CSS/SVG inline, consistent with the existing Tailwind v4 + Radix UI design system
- **Simplicity**: One API endpoint, one page component, eight tab-scoped sub-components

---

## Architecture

### Route Structure

```
app/(main)/analytics/
  page.js                  ← Protected page component (client)

app/api/admin/analytics/
  route.js                 ← Single GET handler, returns full payload
```

The analytics page lives under `app/(main)/` so it inherits the existing sidebar/layout. It does **not** live under `app/(main)/admin/` to match the existing link at `/analytics` in the admin dashboard.

### Data Flow

```
Browser
  │
  ├─ useUser() → isAdmin() check → redirect to /feed if not admin
  │
  └─ fetch('/api/admin/analytics?range=30d')
       │
       └─ route.js
            ├─ getCurrentUser(request) → isAdmin() check → 401/403
            ├─ connectDB()
            └─ Promise.all([
                 userAggregations,
                 contentAggregations,
                 coinAggregations,
                 resourceAggregations,
                 chatAggregations,
                 eventAggregations,
                 moderationAggregations
               ])
               └─ return { users, content, coins, resources, chats, events, moderation }
```

### Time Range Mapping

| UI Label      | `range` param | Date filter                        |
|---------------|---------------|------------------------------------|
| Last 7 Days   | `7d`          | `createdAt >= now - 7 days`        |
| Last 30 Days  | `30d`         | `createdAt >= now - 30 days`       |
| Last 90 Days  | `90d`         | `createdAt >= now - 90 days`       |
| All Time      | `all`         | no date filter on time-series      |

The `range` param is validated server-side; invalid values default to `30d`.

---

## Components and Interfaces

### Component Hierarchy

```
AnalyticsDashboard (page.js)
  ├─ TimeRangeSelector          ← controlled, lifts state up
  ├─ RefreshButton + LastFetched timestamp
  ├─ Tabs (Radix UI)
  │   ├─ OverviewTab
  │   │   └─ StatCard[]         ← reusable stat card with growth badge
  │   ├─ UsersTab
  │   │   ├─ StatCard[]
  │   │   ├─ BarChart (registrations by day)
  │   │   └─ CollegeBreakdownTable
  │   ├─ ContentTab
  │   │   ├─ StatCard[]
  │   │   ├─ BarChart (posts by day)
  │   │   └─ HashtagTable
  │   ├─ EconomyTab
  │   │   ├─ StatCard[]
  │   │   ├─ BarChart (coin volume by day)
  │   │   ├─ ReasonBreakdownChart
  │   │   └─ TopEarnersTable / TopSpendersTable
  │   ├─ ResourcesTab
  │   │   ├─ StatCard[]
  │   │   ├─ CategoryBreakdownChart
  │   │   └─ TopResourcesTable
  │   ├─ ChatsTab
  │   │   ├─ StatCard[]
  │   │   └─ TopGroupsTable
  │   ├─ EventsTab
  │   │   ├─ StatCard[]
  │   │   ├─ CollegeBreakdownChart
  │   │   └─ TopEventsTable
  │   └─ ModerationTab
  │       ├─ StatCard[]
  │       ├─ ActionBreakdownChart
  │       └─ TopAdminsTable
  └─ AnalyticsSkeleton          ← shown during loading
```

### Shared UI Components

**StatCard** — `components/analytics/StatCard.js`
```
Props: { title, value, growth?, unit?, icon? }
- growth > 0  → green badge with ↑
- growth < 0  → red badge with ↓
- growth == 0 → muted badge with →
```

**BarChart** — `components/analytics/BarChart.js`
```
Props: { data: [{label, value}], title, rangeLabel, height? }
- Pure CSS/SVG — no external library
- Bars are div elements with height proportional to max value
- Responsive via Tailwind flex layout
```

**DonutChart** — `components/analytics/DonutChart.js`
```
Props: { data: [{label, value, color}], title }
- SVG-based donut using stroke-dasharray/stroke-dashoffset
- Legend rendered as flex list below
```

**RankedTable** — `components/analytics/RankedTable.js`
```
Props: { columns: [{key, label}], rows: object[], title }
- Simple table with rank column prepended
```

---

## Data Models

### API Request

```
GET /api/admin/analytics?range=30d
Cookie: campusx_token=<jwt>
```

### API Response Shape

```typescript
{
  fetchedAt: string,          // ISO timestamp
  range: '7d' | '30d' | '90d' | 'all',

  users: {
    total: number,
    newInRange: number,
    growth: number,           // percentage vs previous period
    banned: number,
    verified: number,
    dau: number,              // lastActiveDate within 24h
    byCollege: { college: string, count: number }[],   // top 10
    timeSeries: { date: string, count: number }[]
  },

  content: {
    totalPosts: number,
    postsInRange: number,
    postGrowth: number,
    commentsInRange: number,
    engagementRate: number,   // (reactions + comments) / posts * 100
    anonymousPosts: number,
    pollPosts: number,
    imagePosts: number,
    hiddenPosts: number,
    reportedPosts: number,
    topHashtags: { tag: string, count: number }[],     // top 5
    timeSeries: { date: string, count: number }[]
  },

  coins: {
    totalCirculation: number,
    lifetimeEarned: number,
    lifetimeSpent: number,
    volumeInRange: number,
    adminAdjustCount: number,
    byReason: { reason: string, total: number }[],
    topEarners: { username: string, totalEarned: number }[],  // top 5
    topSpenders: { username: string, totalSpent: number }[],  // top 5
    timeSeries: { date: string, total: number }[]
  },

  resources: {
    approved: number,
    pending: number,
    rejected: number,
    uploadedInRange: number,
    totalDownloads: number,
    totalViews: number,
    copyrightFlagged: number,
    byCategory: { category: string, count: number }[],
    topDownloaded: { title: string, category: string, downloadCount: number }[]  // top 5
  },

  chats: {
    activeGroups: number,
    newInRange: number,
    totalMessages: number,
    avgMemberCount: number,
    topGroups: { name: string, messageCount: number }[]  // top 5
  },

  events: {
    active: number,
    upcoming: number,
    past: number,
    createdInRange: number,
    totalRsvps: number,
    topEvents: { title: string, college: string, rsvpCount: number }[],  // top 5
    byCollege: { college: string, count: number }[]    // top 10
  },

  moderation: {
    activeUserBans: number,
    activeIpBans: number,
    actionsInRange: number,
    activeReports: number,
    flaggedResources: number,
    byAction: { action: string, count: number }[],
    topAdmins: { username: string, actionCount: number }[]  // top 3
  }
}
```

---

## Security Implementation

### Route-Level Guard (Client)

```js
// app/(main)/analytics/page.js
const { user, loading } = useUser()
useEffect(() => {
  if (!loading && (!user || !isAdmin(user))) {
    router.push('/feed')
  }
}, [user, loading])
```

### API-Level Guard (Server)

```js
// app/api/admin/analytics/route.js
const currentUser = await getCurrentUser(request)
if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
if (!isAdmin(currentUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

This mirrors the exact pattern used in all existing `/api/admin/*` routes (e.g. `app/api/admin/users/route.js`).

---

## MongoDB Aggregation Pipeline Strategies

### General Principles

1. `$match` on indexed fields is always the **first** stage
2. All independent section aggregations run in `Promise.all`
3. `$group` + `$sort` + `$limit` for top-N queries
4. `$project` to return only needed fields

### Time-Series Aggregation Pattern

```js
// Used for users, posts, coin transactions
{
  $match: { createdAt: { $gte: startDate } }  // indexed field first
},
{
  $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    count: { $sum: 1 }
  }
},
{ $sort: { _id: 1 } }
```

### Growth Metric Calculation

```js
// current period: [startDate, now]
// previous period: [startDate - duration, startDate]
const growth = prevCount === 0
  ? (currCount > 0 ? 100 : 0)
  : Math.round(((currCount - prevCount) / prevCount) * 100)
```

### Coin Economy Aggregation

```js
// Total circulation — single $group over all wallets
Wallet.aggregate([
  { $group: { _id: null, circulation: { $sum: '$balance' }, earned: { $sum: '$totalEarned' }, spent: { $sum: '$totalSpent' } } }
])

// Top earners — lookup username via $lookup
Wallet.aggregate([
  { $sort: { totalEarned: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $project: { username: { $arrayElemAt: ['$user.username', 0] }, totalEarned: 1 } }
])
```

### Event RSVP Count

```js
Event.aggregate([
  { $match: { isActive: true } },
  { $project: { rsvpCount: { $size: '$rsvps' } } },
  { $group: { _id: null, total: { $sum: '$rsvpCount' } } }
])
```

### Engagement Rate

```js
// Computed server-side from aggregated counts
const engagementRate = totalPosts === 0
  ? 0
  : Math.round(((totalReactions + totalComments) / totalPosts) * 100 * 10) / 10
```

---

## Error Handling

| Scenario | API Behavior | UI Behavior |
|---|---|---|
| No auth cookie | Return 401 | Redirect to /feed (caught by route guard) |
| Non-admin token | Return 403 | Redirect to /feed (caught by route guard) |
| DB connection failure | Return 500 with `{ error }` | Show error state with retry button |
| Partial aggregation failure | Return 500 | Show error state with retry button |
| Invalid `range` param | Default to `30d`, return 200 | N/A |
| Empty data for time range | Return zeros/empty arrays | Show "No data for this period" placeholder in charts |

The API does **not** do partial responses — if any aggregation fails, the whole request fails. This keeps the client logic simple (one loading state, one error state).

---

## Performance Optimizations

1. **Parallel execution**: All 7 section aggregations run in `Promise.all` — total latency is bounded by the slowest single aggregation, not their sum.

2. **Indexed `$match` first**: Every pipeline starts with a `$match` on an indexed field (`createdAt`, `status`, `isActive`, `isDeleted`) to avoid full collection scans.

3. **`$project` early**: Only fields needed for the response are projected, reducing document size through the pipeline.

4. **Denormalized counts**: `messageCount` on GroupChat, `commentsCount`/`likesCount` on Post, `downloadCount`/`viewCount` on Resource are already denormalized — no need for expensive `$lookup` + `$size` operations.

5. **No server-side cache**: Vercel serverless has no persistent memory between requests. The client provides a manual refresh button; admins control when to re-fetch. This avoids stale data issues without needing Redis or similar.

6. **`lean()` not used in aggregations**: Aggregation pipelines already return plain objects — no Mongoose overhead.

---

## UI/UX Design Decisions

### Tab Layout

Uses `@radix-ui/react-tabs` exactly as in `app/(main)/admin/page.js`. The tab bar is sticky at `top-[57px]` (below the page header) with `z-10`.

Tabs: **Overview | Users | Content | Economy | Resources | Chats | Events | Moderation**

### Time Range Selector

A `<select>` or button group rendered in the sticky header, right-aligned. Changing the range triggers a re-fetch. The selected range label appears next to each chart title (e.g. "Posts per Day — Last 30 Days").

### Stat Cards

Grid layout: `grid-cols-2 md:grid-cols-4` — matches the existing admin overview. Growth badge uses Tailwind color classes:
- `text-green-400` for positive growth
- `text-red-400` for negative growth  
- `text-muted-foreground` for zero

### CSS Bar Charts

```
┌─────────────────────────────────────────┐
│  Posts per Day — Last 30 Days           │
│                                         │
│  ▓▓▓                                    │
│  ▓▓▓ ▓▓▓                               │
│  ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓                      │
│  ─────────────────                      │
│  Mon Tue Wed Thu                        │
└─────────────────────────────────────────┘
```

Bars are `div` elements inside a `flex items-end` container. Each bar's height is `(value / maxValue) * maxHeightPx`. Labels are truncated with `text-[10px]`. Tooltip on hover via CSS `title` attribute or a simple absolute-positioned div.

### SVG Donut Charts

Used for breakdowns (resources by category, transactions by reason). Built with a single `<svg>` element using `stroke-dasharray` and `stroke-dashoffset` on `<circle>` elements. Colors are drawn from a fixed palette of Tailwind CSS variables.

### Loading State

A skeleton component mirrors the layout of each tab using `animate-pulse` divs — same pattern as existing loading files in the codebase (e.g. `app/(main)/feed/loading.js`).

### Empty State

When a chart's data array is empty or all values are zero, a centered `<p className="text-muted-foreground text-sm">No data for this period</p>` replaces the chart.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Filtered count accuracy

*For any* collection of documents with varying field values (e.g. `isDeleted`, `isBanned`, `isVerified`, `isActive`, `status`), the count returned by the Analytics API for a given filter should equal the number of documents in the collection that satisfy that filter predicate.

**Validates: Requirements 3.1, 3.4, 3.5, 6.1, 6.2, 6.3, 7.1, 8.1, 9.1, 9.2**

### Property 2: Time-range scoping accuracy

*For any* collection of documents with `createdAt` timestamps and any valid time range (7d, 30d, 90d), the count returned by the Analytics API for "items in range" should equal the number of documents whose `createdAt` falls within `[now - rangeDuration, now]`.

**Validates: Requirements 3.2, 4.2, 5.8, 6.4, 7.2, 8.4, 9.3**

### Property 3: Growth metric calculation

*For any* current period count and previous period count, the growth metric returned by the API should equal `round((current - previous) / previous * 100)`, with the special case that when `previous` is 0 and `current` > 0 the growth is 100%, and when both are 0 the growth is 0%.

**Validates: Requirements 3.3, 4.3**

### Property 4: Time-series daily aggregation

*For any* set of documents with `createdAt` timestamps within a time range, the time-series returned by the API should contain one entry per day in the range, and each entry's count should equal the number of documents created on that calendar day.

**Validates: Requirements 3.7, 4.9, 5.9**

### Property 5: Sum aggregation accuracy

*For any* set of wallet documents, the totals returned by the API (`totalCirculation`, `lifetimeEarned`, `lifetimeSpent`) should equal the arithmetic sum of the corresponding fields across all wallet documents. Similarly, `totalDownloads` and `totalViews` should equal the sum of those fields across all approved resources.

**Validates: Requirements 5.1, 5.2, 5.3, 6.5, 6.6**

### Property 6: Top-N ranking accuracy

*For any* set of documents with a numeric ranking field (e.g. `totalEarned`, `totalSpent`, `messageCount`, `downloadCount`, RSVP count), the top-N list returned by the API should be sorted in descending order by that field and contain at most N entries, where each entry's value is greater than or equal to any entry not in the list.

**Validates: Requirements 5.6, 5.7, 6.8, 7.5, 8.6, 9.7**

### Property 7: Grouping and breakdown accuracy

*For any* set of documents with a categorical field (e.g. `college`, `category`, `reason`, `action`), the breakdown returned by the API should correctly count documents per distinct value, and when a limit is specified (top 10 colleges, top 5 hashtags), the returned groups should be the N groups with the highest counts.

**Validates: Requirements 3.6, 4.10, 5.5, 6.7, 8.7, 9.4**

### Property 8: All Time range removes date filter

*For any* database state, when the `range` parameter is `all`, the time-series aggregations returned by the API should include documents from all time periods without any `createdAt` lower bound, meaning the total count across all time-series entries equals the total unfiltered count of that entity type.

**Validates: Requirements 11.4**

### Property 9: Growth metric color coding

*For any* numeric growth value, the StatCard component should render the growth badge with `text-green-400` when the value is positive, `text-red-400` when the value is negative, and `text-muted-foreground` when the value is exactly zero.

**Validates: Requirements 10.3, 10.4, 10.5**

### Property 10: Tab time range preservation

*For any* selected time range value, switching between tabs in the Analytics Dashboard should not change the selected time range — the same range value should be active before and after the tab switch.

**Validates: Requirements 14.4**

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- **Unit tests** cover specific examples, integration points, and error conditions
- **Property tests** verify universal correctness across randomly generated inputs

### Unit Tests (specific examples and edge cases)

- API returns 401 with no cookie
- API returns 403 with non-admin token
- API returns 200 with valid admin token and correct payload shape
- Route redirects unauthenticated user to `/feed`
- Route redirects non-admin to `/feed`
- Route renders dashboard for admin
- Time range selector defaults to `30d` on mount
- Changing time range triggers re-fetch
- Empty data array renders "No data for this period" placeholder
- API failure renders error state with retry button
- Loading state renders skeleton
- Tab switching preserves selected time range
- Overview tab renders all 6 required stat cards
- All 8 tabs render with correct labels

### Property-Based Tests

Use **fast-check** (compatible with Next.js/Jest/Vitest, no native dependencies).

Minimum **100 iterations** per property test. Each test is tagged with a comment referencing the design property.

```js
// Feature: admin-analytics-dashboard, Property 1: Filtered count accuracy
// Feature: admin-analytics-dashboard, Property 2: Time-range scoping accuracy
// Feature: admin-analytics-dashboard, Property 3: Growth metric calculation
// Feature: admin-analytics-dashboard, Property 4: Time-series daily aggregation
// Feature: admin-analytics-dashboard, Property 5: Sum aggregation accuracy
// Feature: admin-analytics-dashboard, Property 6: Top-N ranking accuracy
// Feature: admin-analytics-dashboard, Property 7: Grouping and breakdown accuracy
// Feature: admin-analytics-dashboard, Property 8: All Time range removes date filter
// Feature: admin-analytics-dashboard, Property 9: Growth metric color coding
// Feature: admin-analytics-dashboard, Property 10: Tab time range preservation
```

**Property test targets** (pure functions extracted from the API handler for testability):

- `computeGrowth(current, previous)` → Properties 3, 9
- `buildTimeSeriesFromDocs(docs, startDate, endDate)` → Property 4
- `computeTopN(items, field, n)` → Property 6
- `groupByField(items, field, limit)` → Property 7
- `applyDateFilter(query, range)` → Property 8
- `getGrowthColorClass(growth)` → Property 9

Properties 1, 2, 5 are tested against a MongoDB in-memory instance (e.g. `mongodb-memory-server`) with randomly generated seed data.

### Test File Structure

```
__tests__/
  analytics/
    unit/
      api.auth.test.js          ← 401/403/200 examples
      route.guard.test.js       ← redirect examples
      ui.states.test.js         ← loading/error/empty examples
    property/
      computeGrowth.test.js     ← Properties 3, 9
      timeSeries.test.js        ← Property 4
      topN.test.js              ← Property 6
      groupBy.test.js           ← Property 7
      dateFilter.test.js        ← Property 8
      colorClass.test.js        ← Property 9
      aggregations.test.js      ← Properties 1, 2, 5 (with mongodb-memory-server)
```
