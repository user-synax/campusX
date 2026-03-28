# Implementation Plan: Achievements & Badges

## Overview

Implement the achievements and badges system as a thin, non-blocking layer on top of the existing coins/wallet infrastructure. Badges are `ShopItem` documents with `category: 'achievement_badge'`, stored in `Wallet.inventory[]` via the same atomic pattern as `awardWhaleBadge()`.

## Tasks

- [x] 1. Update ShopItem model — add `achievement_badge` category
  - Add `'achievement_badge'` to the `category` enum in `models/ShopItem.js`
  - _Requirements: 1.2_

- [ ] 2. Create `lib/achievements.js` — catalog, core award logic, and per-trigger checkers
  - [ ] 2.1 Define `BADGE_CATALOG` constant and `awardBadge()` helper
    - Export `BADGE_CATALOG` as a plain JS array of `{ slug, emoji, name, description, trigger }` objects covering all 32 badges from Requirement 1.1
    - Implement `awardBadge(userId, slug)`: look up `ShopItem` by slug, call `Wallet.findOneAndUpdate` with `{ 'inventory.itemId': { $ne: badge._id } }` filter, call `createNotification` with `type: 'achievement'` and `meta: { badgeSlug, badgeName, badgeEmoji }` only when the document was modified, return `true` if awarded else `false`
    - Use `getOrCreateWallet` to ensure wallet exists before the update
    - Wrap everything in try/catch — never throw
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Write property test for `awardBadge` idempotency (Property 3)
    - **Property 3: Badge award idempotency**
    - **Validates: Requirements 2.1, 2.2, 3.4**
    - Use fast-check to generate random userId + slug, call `awardBadge` N times (N ≥ 2), assert `Wallet.inventory` has exactly one entry for that badge

  - [x] 2.3 Write property test for notification-on-new-award-only (Property 4)
    - **Property 4: Notification on new award only**
    - **Validates: Requirements 3.1, 3.2, 3.4**
    - Use fast-check to generate random userId + slug, call `awardBadge` twice, assert `Notification` count for that `meta.badgeSlug` is exactly 1

  - [ ] 2.4 Implement `checkPostingBadges`, `checkFollowerBadges`, `checkStreakBadges`
    - `checkPostingBadges(userId)`: count non-anonymous, non-deleted posts by user; call `awardBadge` for every posting milestone badge whose threshold ≤ count (`badge-first-post` @1, `badge-post-10` @10, `badge-post-50` @50, `badge-post-100` @100, `badge-post-500` @500)
    - `checkFollowerBadges(userId)`: read `User.followers.length`; award follower milestone badges whose threshold ≤ count (`badge-followers-10/50/100/500/1000`)
    - `checkStreakBadges(userId)`: read `User.currentStreak`; award streak milestone badges whose threshold ≤ streak (`badge-streak-3/7/30/100`)
    - _Requirements: 4.2, 4.3, 5.2, 6.2_

  - [x] 2.5 Write property test for milestone threshold coverage — posting, followers, streak (Property 2, partial)
    - **Property 2: Milestone threshold coverage (posting / followers / streak)**
    - **Validates: Requirements 4.2, 4.3, 5.2, 6.2**
    - Use fast-check to generate random metric value N for each trigger group; set up user state; run `checkAchievements`; assert all badges with threshold ≤ N are in inventory and no badge with threshold > N is present

  - [ ] 2.6 Implement `checkCoinsEarnedBadges`, `checkCoinsSpentBadges`, `checkLikeBadges`, `checkCommentBadges`, `checkReferralBadges`, `checkLevelBadges`
    - `checkCoinsEarnedBadges(userId)`: read `Wallet.totalEarned`; award `badge-coins-100` @100 and `badge-coins-1000` @1000 (skip `badge-whale` — handled by existing `awardWhaleBadge()`)
    - `checkCoinsSpentBadges(userId)`: read `Wallet.totalSpent`; award `badge-spender-500` @500 and `badge-spender-5000` @5000
    - `checkLikeBadges(userId)`: aggregate `sum(likesCount)` across all non-deleted posts by user; award `badge-likes-10/100/500`
    - `checkCommentBadges(userId)`: aggregate `sum(commentsCount)` across all non-deleted posts by user; award `badge-comments-10/50`
    - `checkReferralBadges(userId)`: read `User.referralCount`; award `badge-referral-1/5/10`
    - `checkLevelBadges(userId)`: read `User.level`; award `badge-level-10/25/50`
    - _Requirements: 7.2, 7.4, 8.2, 8.4, 9.2, 10.2_

  - [x] 2.7 Write property test for milestone threshold coverage — economy, engagement, referral, level (Property 2, partial)
    - **Property 2: Milestone threshold coverage (economy / engagement / referral / level)**
    - **Validates: Requirements 7.2, 7.4, 8.2, 8.4, 9.2, 10.2**
    - Use fast-check to generate random metric values for each remaining trigger group; assert correct badge award behavior

  - [ ] 2.8 Implement `checkAchievements(userId, trigger)` — main entry point
    - Export `checkAchievements(userId, trigger)` that wraps a `switch(trigger)` dispatching to the per-trigger helpers implemented in 2.4 and 2.6
    - Handle triggers: `post_created`, `follower_gained`, `streak_updated`, `coins_earned`, `coins_spent`, `like_received`, `comment_received`, `referral_made`, `level_up`
    - Unknown triggers are silently ignored
    - Outer try/catch ensures the function always resolves — never rejects
    - _Requirements: 2.4, 12.1, 12.3_

  - [x] 2.9 Write property test for error non-propagation (Property 5)
    - **Property 5: Error non-propagation**
    - **Validates: Requirements 2.4, 3.3, 12.3**
    - Use fast-check to generate random invalid inputs (null userId, garbage trigger strings); assert `checkAchievements` always resolves and never throws

- [ ] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create seed script `scripts/seed-badges.mjs`
  - Import `BADGE_CATALOG` from `lib/achievements.js`
  - For each badge, call `ShopItem.findOneAndUpdate({ slug }, { $setOnInsert: { slug, name, description, category: 'achievement_badge', price: 0, isActive: true, visual: { emoji }, rarity } }, { upsert: true, new: true })`
  - Count and log created vs skipped badges on completion
  - _Requirements: 1.2, 1.3, 13.1, 13.2, 13.3_

  - [x] 4.1 Write property test for seed script idempotency (Property 7)
    - **Property 7: Seed script idempotency**
    - **Validates: Requirements 13.1, 13.2**
    - Run seed logic twice against an in-memory/test DB; assert `ShopItem.countDocuments({ category: 'achievement_badge' })` equals `BADGE_CATALOG.length` — no more, no less

  - [ ] 4.2 Write property test for badge document shape invariant (Property 1)
    - **Property 1: Badge document shape invariant**
    - **Validates: Requirements 1.2**
    - For each slug in `BADGE_CATALOG`, assert the DB document has `category === 'achievement_badge'`, `price === 0`, and `isActive === true`

- [ ] 5. Wire trigger points — post creation, follow, coins, like, comment, referral, level-up, streak
  - [ ] 5.1 Wire `post_created` trigger in `app/api/posts/create/route.js`
    - After the post is saved and the author is non-anonymous, add: `checkAchievements(currentUser._id, 'post_created').catch(() => {})`
    - _Requirements: 4.1_

  - [ ] 5.2 Write unit test for `post_created` trigger wiring
    - Assert that after a successful non-anonymous post creation, `checkAchievements` is called with the correct userId and `'post_created'`
    - _Requirements: 4.1_

  - [ ] 5.3 Wire `follower_gained` trigger in `app/api/follow/route.js`
    - Inside the `nowFollowing` branch (after `currentUser.save()` and `targetUser.save()`), add: `checkAchievements(targetUserId, 'follower_gained').catch(() => {})`
    - _Requirements: 5.1_

  - [ ] 5.4 Write unit test for `follower_gained` trigger wiring
    - Assert that after a follow (not unfollow), `checkAchievements` is called with the followed user's ID and `'follower_gained'`
    - _Requirements: 5.1_

  - [~] 5.5 Wire `coins_earned` and `coins_spent` triggers in `lib/coins.js`
    - In `awardCoins()`, after the successful wallet update (inside `execute`), add: `checkAchievements(userId, 'coins_earned').catch(() => {})`
    - In `spendCoins()`, after the successful purchase (inside `execute`), add: `checkAchievements(userId, 'coins_spent').catch(() => {})`
    - _Requirements: 7.1, 7.3_

  - [~] 5.6 Wire `like_received` trigger in `app/api/posts/like/route.js`
    - In the like (not unlike) branch, after the existing `awardCoins` call for `like_received`, add: `checkAchievements(post.author, 'like_received').catch(() => {})` (guard: non-anonymous post, author exists, not self-like)
    - _Requirements: 8.1_

  - [ ] 5.7 Write unit test for `like_received` trigger wiring
    - Assert that after a like on another user's post, `checkAchievements` is called with the post author's ID and `'like_received'`
    - _Requirements: 8.1_

  - [ ] 5.8 Wire `comment_received` trigger in `app/api/posts/[postId]/comments/route.js`
    - After the existing `awardCoins(post.author, 'comment_received', ...)` call, add: `checkAchievements(post.author, 'comment_received').catch(() => {})` (guard: author exists, not own post)
    - _Requirements: 8.3_

  - [ ] 5.9 Wire `referral_made` trigger in `app/api/auth/signup/route.js`
    - After `User.referralCount` is incremented for the referrer (wherever referral recording happens), add: `checkAchievements(referrerId, 'referral_made').catch(() => {})`
    - If referral recording does not yet exist, add it: find the referrer by `referralCode`, increment `referralCount`, then fire the achievement check
    - _Requirements: 9.1_

  - [ ] 5.10 Wire `streak_updated` and `level_up` triggers in `lib/xp.js`
    - In `awardXP()`, after `User.updateOne` sets the new streak/level, add:
      - `checkAchievements(userId, 'streak_updated').catch(() => {})` when `currentStreak` was incremented
      - `checkAchievements(userId, 'level_up').catch(() => {})` when `leveledUp === true`
    - _Requirements: 6.1, 10.1_

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update Profile API to include `earnedBadges`
  - In `app/api/users/[username]/route.js` GET handler, after fetching `userResult`:
    - Fetch `Wallet.inventory` for the user
    - Query `ShopItem.find({ _id: { $in: inventoryItemIds }, category: 'achievement_badge' }).select('slug name visual')`
    - Build `earnedBadges` array: `[{ slug, name, emoji: visual.emoji, earnedAt }]` using `purchasedAt` from inventory as `earnedAt`
    - Include `earnedBadges` in the response object
  - _Requirements: 11.1, 11.2_

  - [ ] 7.1 Write property test for profile API `earnedBadges` shape (Property 6)
    - **Property 6: Profile API earnedBadges shape**
    - **Validates: Requirements 11.1, 11.2**
    - Use fast-check to generate a user with N random achievement badges in their wallet; call the profile API handler; assert every element in `earnedBadges` has `slug`, `name`, `emoji`, `earnedAt` and corresponds to a `ShopItem` with `category === 'achievement_badge'`

- [ ] 8. Create `components/profile/BadgesSection.js` UI component
  - Client component accepting `{ badges: Array<{ slug, name, emoji, earnedAt }> }` prop
  - Render a section heading "Achievements"
  - Render a flex-wrap grid of badge pills, each showing `{emoji} {name}`
  - Render "No badges yet" empty state when `badges.length === 0`
  - _Requirements: 11.3, 11.4_

  - [ ] 8.1 Write unit tests for `BadgesSection`
    - Test: renders "No badges yet" when `badges` prop is `[]`
    - Test: renders correct emoji and name for each badge in the prop
    - _Requirements: 11.3, 11.4_

- [ ] 9. Integrate `BadgesSection` into the profile page
  - In `app/(main)/profile/[username]/page.js`, import `BadgesSection` dynamically (`next/dynamic`, `ssr: false`)
  - Render `<BadgesSection badges={profileUser.earnedBadges ?? []} />` below the `<ActivityHeatmap>` block and above the posts tab bar, for non-founder profiles
  - _Requirements: 11.3, 11.4_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `badge-whale` is intentionally excluded from `checkCoinsEarnedBadges` — it remains handled by the existing `awardWhaleBadge()` in `lib/coins.js`
- The seed script must be run (`node scripts/seed-badges.mjs`) before the achievement system can award any badges
- Property tests use fast-check with a minimum of 100 iterations per property
