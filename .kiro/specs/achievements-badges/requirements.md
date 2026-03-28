# Requirements Document

## Introduction

The Achievements & Badges system for CampusX rewards users for reaching milestones across posting, social growth, streaks, economy, and engagement. Badges are stored in the user's Wallet inventory (consistent with the existing `awardWhaleBadge()` pattern), displayed on the user's profile, and trigger an `achievement` notification upon unlock. Badge checks are fire-and-forget — they never block the main action that triggered them. Awards are idempotent: a user can never earn the same badge twice.

## Glossary

- **Badge_Catalog**: The static, server-side registry of all defined badges and their unlock conditions.
- **Badge_Checker**: The server-side module (`lib/achievements.js`) responsible for evaluating unlock conditions and awarding badges.
- **Badge**: A named milestone reward with an emoji, slug, name, description, and unlock condition. Stored as a `ShopItem` with category `achievement_badge`.
- **Wallet**: The existing `Wallet` model; badges are added to `inventory[]` using the same pattern as `awardWhaleBadge()`.
- **Achievement_Notification**: A `Notification` document of type `achievement` sent to the recipient when a badge is unlocked.
- **Trigger_Point**: A location in the codebase (API route or lib function) where a badge check is initiated fire-and-forget after a main action completes.
- **Idempotency**: The guarantee that awarding the same badge to the same user more than once has no additional effect.
- **Post**: A document in the `Post` or `AnonymousPost` collection authored by a user.
- **Follower_Count**: The length of `User.followers[]` for a given user.
- **Streak**: `User.currentStreak` — consecutive daily login days.
- **Total_Coins_Earned**: `Wallet.totalEarned` — lifetime coins earned, used for economy badges.
- **Likes_Received**: The cumulative count of likes received across all of a user's posts.
- **Comments_Received**: The cumulative count of comments received across all of a user's posts.

---

## Requirements

### Requirement 1: Badge Catalog Definition

**User Story:** As a platform designer, I want a comprehensive, well-defined badge catalog, so that users have clear, motivating milestones to work toward across all activity dimensions.

#### Acceptance Criteria

1. THE Badge_Catalog SHALL define badges for the following categories and conditions:

   **Posting Milestones**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-first-post` | 📝 | First Post | Create 1st post |
   | `badge-post-10` | ✍️ | Regular Writer | Create 10 posts |
   | `badge-post-50` | 🖊️ | Prolific Poster | Create 50 posts |
   | `badge-post-100` | 📚 | Century Poster | Create 100 posts |
   | `badge-post-500` | 🏆 | Legend Poster | Create 500 posts |

   **Social Milestones (Followers)**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-followers-10` | 👥 | Rising Star | Reach 10 followers |
   | `badge-followers-50` | 🌟 | Popular | Reach 50 followers |
   | `badge-followers-100` | 💫 | Influencer | Reach 100 followers |
   | `badge-followers-500` | 🚀 | Campus Celebrity | Reach 500 followers |
   | `badge-followers-1000` | 👑 | Campus Legend | Reach 1,000 followers |

   **Streak Milestones**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-streak-3` | 🔥 | On Fire | 3-day login streak |
   | `badge-streak-7` | 🗓️ | Week Warrior | 7-day login streak |
   | `badge-streak-30` | 📅 | Monthly Grind | 30-day login streak |
   | `badge-streak-100` | ⚡ | Unstoppable | 100-day login streak |

   **Economy / Coin Milestones**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-coins-100` | 🪙 | Coin Collector | Earn 100 total coins |
   | `badge-coins-1000` | 💰 | Coin Hoarder | Earn 1,000 total coins |
   | `badge-whale` | 🐳 | Whale | Earn 10,000 total coins (already exists) |
   | `badge-spender-500` | 🛍️ | Big Spender | Spend 500 total coins |
   | `badge-spender-5000` | 💸 | High Roller | Spend 5,000 total coins |

   **Engagement Milestones (Likes & Comments Received)**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-likes-10` | ❤️ | Liked | Receive 10 total likes |
   | `badge-likes-100` | 💖 | Crowd Pleaser | Receive 100 total likes |
   | `badge-likes-500` | 🔥 | Viral | Receive 500 total likes |
   | `badge-comments-10` | 💬 | Conversation Starter | Receive 10 total comments |
   | `badge-comments-50` | 🗣️ | Discussion Leader | Receive 50 total comments |

   **Social Interaction Milestones**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-referral-1` | 🤝 | Connector | Refer 1 user |
   | `badge-referral-5` | 🌐 | Networker | Refer 5 users |
   | `badge-referral-10` | 🏅 | Ambassador | Refer 10 users |

   **Special / Prestige Badges**
   | Slug | Emoji | Name | Condition |
   |---|---|---|---|
   | `badge-early-adopter` | 🌱 | Early Adopter | Account created within first 30 days of platform launch |
   | `badge-level-10` | 🎯 | Level 10 | Reach XP level 10 |
   | `badge-level-25` | 🎖️ | Level 25 | Reach XP level 25 |
   | `badge-level-50` | 💎 | Level 50 | Reach XP level 50 |

2. THE Badge_Catalog SHALL store each badge as a `ShopItem` document with `category: 'achievement_badge'`, `price: 0`, and `isActive: true`.

3. THE Badge_Catalog SHALL be seeded via a script so all badge `ShopItem` documents exist before the system runs.

---

### Requirement 2: Badge Award Idempotency

**User Story:** As a platform operator, I want badge awards to be idempotent, so that no user can earn the same badge more than once regardless of how many times the trigger fires.

#### Acceptance Criteria

1. WHEN the Badge_Checker attempts to award a badge, THE Badge_Checker SHALL first check whether the badge's `ShopItem._id` already exists in `Wallet.inventory[]` for that user.
2. IF the badge already exists in `Wallet.inventory[]`, THEN THE Badge_Checker SHALL skip the award and return without error.
3. THE Badge_Checker SHALL use a single atomic `findOneAndUpdate` with `{ 'inventory.itemId': { $ne: badgeId } }` as the filter to prevent race conditions.
4. THE Badge_Checker SHALL NOT throw or propagate errors to the calling Trigger_Point — all errors SHALL be caught and logged internally.

---

### Requirement 3: Achievement Notification

**User Story:** As a user, I want to receive a notification when I unlock a badge, so that I know about my achievement immediately.

#### Acceptance Criteria

1. WHEN a badge is successfully added to `Wallet.inventory[]`, THE Badge_Checker SHALL create a `Notification` document with `type: 'achievement'`, `recipient` set to the user's ID, `sender: null`, and `meta` containing `{ badgeSlug, badgeName, badgeEmoji }`.
2. THE Badge_Checker SHALL only send the Achievement_Notification after confirming the badge was newly added (i.e., the `findOneAndUpdate` modified a document).
3. IF the notification creation fails, THEN THE Badge_Checker SHALL log the error and continue without rethrowing.
4. THE Badge_Checker SHALL NOT send duplicate Achievement_Notifications for the same badge and user.

---

### Requirement 4: Trigger Points — Post Milestones

**User Story:** As a user, I want to earn posting badges automatically when I hit post count milestones, so that my writing activity is recognized.

#### Acceptance Criteria

1. WHEN a new post is successfully created by a non-anonymous user, THE Badge_Checker SHALL be invoked fire-and-forget with the user's ID and trigger type `'post_created'`.
2. WHEN `'post_created'` is triggered, THE Badge_Checker SHALL count the user's total non-anonymous posts and evaluate eligibility for all posting milestone badges (`badge-first-post`, `badge-post-10`, `badge-post-50`, `badge-post-100`, `badge-post-500`).
3. THE Badge_Checker SHALL award all newly-reached posting milestone badges in a single trigger invocation (e.g., if a user reaches post 50 and 100 simultaneously due to a data migration, both badges are awarded).

---

### Requirement 5: Trigger Points — Follower Milestones

**User Story:** As a user, I want to earn follower badges automatically when my follower count hits milestones, so that my social growth is recognized.

#### Acceptance Criteria

1. WHEN a follow action is successfully completed, THE Badge_Checker SHALL be invoked fire-and-forget with the followed user's ID and trigger type `'follower_gained'`.
2. WHEN `'follower_gained'` is triggered, THE Badge_Checker SHALL read `User.followers.length` for the followed user and evaluate eligibility for all follower milestone badges (`badge-followers-10`, `badge-followers-50`, `badge-followers-100`, `badge-followers-500`, `badge-followers-1000`).

---

### Requirement 6: Trigger Points — Streak Milestones

**User Story:** As a user, I want to earn streak badges automatically when my login streak hits milestones, so that my consistency is recognized.

#### Acceptance Criteria

1. WHEN a user's `currentStreak` is updated (during daily login or XP award), THE Badge_Checker SHALL be invoked fire-and-forget with the user's ID and trigger type `'streak_updated'`.
2. WHEN `'streak_updated'` is triggered, THE Badge_Checker SHALL read `User.currentStreak` and evaluate eligibility for all streak milestone badges (`badge-streak-3`, `badge-streak-7`, `badge-streak-30`, `badge-streak-100`).

---

### Requirement 7: Trigger Points — Economy Milestones

**User Story:** As a user, I want to earn economy badges automatically when my coin totals hit milestones, so that my platform participation is recognized.

#### Acceptance Criteria

1. WHEN coins are successfully awarded to a user (via `awardCoins()`), THE Badge_Checker SHALL be invoked fire-and-forget with the user's ID and trigger type `'coins_earned'`.
2. WHEN `'coins_earned'` is triggered, THE Badge_Checker SHALL read `Wallet.totalEarned` and evaluate eligibility for coin-earning badges (`badge-coins-100`, `badge-coins-1000`). The `badge-whale` at 10,000 coins is handled by the existing `awardWhaleBadge()` in `lib/coins.js` and SHALL NOT be duplicated.
3. WHEN coins are successfully spent by a user (via `spendCoins()`), THE Badge_Checker SHALL be invoked fire-and-forget with the user's ID and trigger type `'coins_spent'`.
4. WHEN `'coins_spent'` is triggered, THE Badge_Checker SHALL read `Wallet.totalSpent` and evaluate eligibility for coin-spending badges (`badge-spender-500`, `badge-spender-5000`).

---

### Requirement 8: Trigger Points — Engagement Milestones

**User Story:** As a user, I want to earn engagement badges when my posts receive enough likes and comments, so that the quality of my content is recognized.

#### Acceptance Criteria

1. WHEN a like is added to a user's post, THE Badge_Checker SHALL be invoked fire-and-forget with the post author's ID and trigger type `'like_received'`.
2. WHEN `'like_received'` is triggered, THE Badge_Checker SHALL aggregate the total `likesCount` across all of the user's posts and evaluate eligibility for like milestone badges (`badge-likes-10`, `badge-likes-100`, `badge-likes-500`).
3. WHEN a comment is added to a user's post, THE Badge_Checker SHALL be invoked fire-and-forget with the post author's ID and trigger type `'comment_received'`.
4. WHEN `'comment_received'` is triggered, THE Badge_Checker SHALL aggregate the total `commentsCount` across all of the user's posts and evaluate eligibility for comment milestone badges (`badge-comments-10`, `badge-comments-50`).

---

### Requirement 9: Trigger Points — Referral Milestones

**User Story:** As a user, I want to earn referral badges when I successfully refer other users, so that my contribution to platform growth is recognized.

#### Acceptance Criteria

1. WHEN a referral is successfully recorded (incrementing `User.referralCount`), THE Badge_Checker SHALL be invoked fire-and-forget with the referrer's ID and trigger type `'referral_made'`.
2. WHEN `'referral_made'` is triggered, THE Badge_Checker SHALL read `User.referralCount` and evaluate eligibility for referral badges (`badge-referral-1`, `badge-referral-5`, `badge-referral-10`).

---

### Requirement 10: Trigger Points — XP Level Milestones

**User Story:** As a user, I want to earn level badges when I reach XP level milestones, so that my progression is recognized.

#### Acceptance Criteria

1. WHEN a user's XP level increases (via `awardXP()`), THE Badge_Checker SHALL be invoked fire-and-forget with the user's ID and trigger type `'level_up'`.
2. WHEN `'level_up'` is triggered, THE Badge_Checker SHALL read `User.level` and evaluate eligibility for level milestone badges (`badge-level-10`, `badge-level-25`, `badge-level-50`).

---

### Requirement 11: Badge Display on Profile

**User Story:** As a visitor, I want to see a user's earned badges on their profile page, so that I can appreciate their achievements.

#### Acceptance Criteria

1. THE Profile_API (`/api/users/[username]`) SHALL include an `earnedBadges` array in the response, containing each badge's `slug`, `name`, `emoji`, and `earnedAt` timestamp.
2. WHEN fetching earned badges, THE Profile_API SHALL join `Wallet.inventory[]` items where the corresponding `ShopItem.category` is `'achievement_badge'`.
3. THE Profile_Page SHALL render earned badges as a visually distinct section, displaying each badge's emoji and name.
4. WHILE a user has zero earned badges, THE Profile_Page SHALL render an empty state rather than hiding the section entirely.

---

### Requirement 12: Performance — Fire-and-Forget Execution

**User Story:** As a platform engineer, I want badge checks to never block main API responses, so that user-facing latency is unaffected.

#### Acceptance Criteria

1. THE Badge_Checker SHALL be invoked using fire-and-forget at every Trigger_Point: `checkAchievements(userId, trigger).catch(() => {})`.
2. THE Badge_Checker SHALL complete all database reads and writes independently of the HTTP response lifecycle.
3. IF the Badge_Checker throws an unhandled error, THEN THE Badge_Checker SHALL log the error to the console and return without affecting the calling route's response.

---

### Requirement 13: Seed Script for Badge ShopItems

**User Story:** As a developer, I want a seed script that creates all badge ShopItem documents, so that the system works correctly in any environment.

#### Acceptance Criteria

1. THE Seed_Script (`scripts/seed-badges.mjs`) SHALL upsert all badges defined in the Badge_Catalog into the `ShopItem` collection using `slug` as the unique key.
2. THE Seed_Script SHALL be idempotent: running it multiple times SHALL NOT create duplicate documents.
3. THE Seed_Script SHALL log the count of created and skipped (already existing) badges upon completion.
