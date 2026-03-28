import connectDB from './db.js'
import ShopItem from '../models/ShopItem.js'
import Wallet from '../models/Wallet.js'
import { getOrCreateWallet } from './coins.js'
import { createNotification } from './notifications.js'

// ── Badge Catalog ─────────────────────────────────────────────────────────────

export const BADGE_CATALOG = [
  // Posting milestones
  { slug: 'badge-first-post',   emoji: '📝', name: 'First Post',       description: 'Published your first post',          trigger: 'post_created',     threshold: 1 },
  { slug: 'badge-post-10',      emoji: '✍️',  name: '10 Posts',         description: 'Published 10 posts',                 trigger: 'post_created',     threshold: 10 },
  { slug: 'badge-post-50',      emoji: '📚', name: '50 Posts',         description: 'Published 50 posts',                 trigger: 'post_created',     threshold: 50 },
  { slug: 'badge-post-100',     emoji: '🗞️', name: '100 Posts',        description: 'Published 100 posts',                trigger: 'post_created',     threshold: 100 },
  { slug: 'badge-post-500',     emoji: '🏛️', name: '500 Posts',        description: 'Published 500 posts',                trigger: 'post_created',     threshold: 500 },
  // Follower milestones
  { slug: 'badge-followers-10',   emoji: '👥', name: '10 Followers',    description: 'Gained 10 followers',                trigger: 'follower_gained',  threshold: 10 },
  { slug: 'badge-followers-50',   emoji: '🌟', name: '50 Followers',    description: 'Gained 50 followers',                trigger: 'follower_gained',  threshold: 50 },
  { slug: 'badge-followers-100',  emoji: '💫', name: '100 Followers',   description: 'Gained 100 followers',               trigger: 'follower_gained',  threshold: 100 },
  { slug: 'badge-followers-500',  emoji: '🌠', name: '500 Followers',   description: 'Gained 500 followers',               trigger: 'follower_gained',  threshold: 500 },
  { slug: 'badge-followers-1000', emoji: '🚀', name: '1000 Followers',  description: 'Gained 1000 followers',              trigger: 'follower_gained',  threshold: 1000 },
  // Streak milestones
  { slug: 'badge-streak-3',    emoji: '🔥', name: '3-Day Streak',      description: 'Maintained a 3-day streak',          trigger: 'streak_updated',   threshold: 3 },
  { slug: 'badge-streak-7',    emoji: '⚡', name: '7-Day Streak',      description: 'Maintained a 7-day streak',          trigger: 'streak_updated',   threshold: 7 },
  { slug: 'badge-streak-30',   emoji: '🌊', name: '30-Day Streak',     description: 'Maintained a 30-day streak',         trigger: 'streak_updated',   threshold: 30 },
  { slug: 'badge-streak-100',  emoji: '💎', name: '100-Day Streak',    description: 'Maintained a 100-day streak',        trigger: 'streak_updated',   threshold: 100 },
  // Coins earned milestones
  { slug: 'badge-coins-100',   emoji: '🪙', name: '100 Coins Earned',  description: 'Earned 100 coins total',             trigger: 'coins_earned',     threshold: 100 },
  { slug: 'badge-coins-1000',  emoji: '💰', name: '1000 Coins Earned', description: 'Earned 1000 coins total',            trigger: 'coins_earned',     threshold: 1000 },
  // Coins spent milestones
  { slug: 'badge-spender-500',  emoji: '🛍️', name: 'Big Spender',      description: 'Spent 500 coins',                   trigger: 'coins_spent',      threshold: 500 },
  { slug: 'badge-spender-5000', emoji: '💸', name: 'High Roller',       description: 'Spent 5000 coins',                  trigger: 'coins_spent',      threshold: 5000 },
  // Likes received milestones
  { slug: 'badge-likes-10',    emoji: '❤️',  name: '10 Likes',          description: 'Received 10 likes on posts',         trigger: 'like_received',    threshold: 10 },
  { slug: 'badge-likes-100',   emoji: '💖', name: '100 Likes',         description: 'Received 100 likes on posts',        trigger: 'like_received',    threshold: 100 },
  { slug: 'badge-likes-500',   emoji: '💝', name: '500 Likes',         description: 'Received 500 likes on posts',        trigger: 'like_received',    threshold: 500 },
  // Comments received milestones
  { slug: 'badge-comments-10', emoji: '💬', name: '10 Comments',       description: 'Received 10 comments on posts',      trigger: 'comment_received', threshold: 10 },
  { slug: 'badge-comments-50', emoji: '🗣️', name: '50 Comments',       description: 'Received 50 comments on posts',      trigger: 'comment_received', threshold: 50 },
  // Referral milestones
  { slug: 'badge-referral-1',  emoji: '🤝', name: 'First Referral',    description: 'Referred 1 user',                   trigger: 'referral_made',    threshold: 1 },
  { slug: 'badge-referral-5',  emoji: '🌐', name: '5 Referrals',       description: 'Referred 5 users',                  trigger: 'referral_made',    threshold: 5 },
  { slug: 'badge-referral-10', emoji: '🏆', name: '10 Referrals',      description: 'Referred 10 users',                 trigger: 'referral_made',    threshold: 10 },
  // Level milestones
  { slug: 'badge-level-10',    emoji: '⭐', name: 'Level 10',          description: 'Reached level 10',                  trigger: 'level_up',         threshold: 10 },
  { slug: 'badge-level-25',    emoji: '🌟', name: 'Level 25',          description: 'Reached level 25',                  trigger: 'level_up',         threshold: 25 },
  { slug: 'badge-level-50',    emoji: '👑', name: 'Level 50',          description: 'Reached level 50',                  trigger: 'level_up',         threshold: 50 },
  // Special / event badges (placeholders to reach 32)
  { slug: 'badge-early-adopter', emoji: '🌱', name: 'Early Adopter',   description: 'Joined during the early access period', trigger: null,            threshold: null },
  { slug: 'badge-verified',      emoji: '✅', name: 'Verified',         description: 'Verified campus email',             trigger: null,               threshold: null },
  { slug: 'badge-whale',         emoji: '🐋', name: 'Whale',            description: 'Earned 10,000 coins total',          trigger: 'coins_earned',     threshold: 10000 },
  { slug: 'badge-og',            emoji: '🎖️', name: 'OG',               description: 'One of the first 100 users',         trigger: null,               threshold: null },
]

// ── Core award helper ─────────────────────────────────────────────────────────

/**
 * Award a badge to a user by slug.
 * Idempotent — uses $ne filter to prevent double-awards.
 * @returns {Promise<boolean>} true if newly awarded, false if already owned or not found
 */
export async function awardBadge(userId, slug) {
  try {
    await connectDB()

    const badge = await ShopItem.findOne({ slug })
    if (!badge) return false

    await getOrCreateWallet(userId)

    const result = await Wallet.findOneAndUpdate(
      { userId, 'inventory.itemId': { $ne: badge._id } },
      { $push: { inventory: { itemId: badge._id, purchasedAt: new Date() } } },
      { new: true }
    )

    if (!result) return false

    // Notify only on first award
    createNotification({
      type: 'achievement',
      recipient: userId,
      sender: null,
      meta: {
        badgeSlug: slug,
        badgeName: badge.name,
        badgeEmoji: badge.visual?.emoji ?? '',
      },
    }).catch(() => {})

    return true
  } catch (err) {
    console.error('[Achievements] awardBadge error:', err)
    return false
  }
}

// ── Per-trigger checkers ──────────────────────────────────────────────────────

export async function checkPostingBadges(userId) {
  // Implemented in task 2.4
}

export async function checkFollowerBadges(userId) {
  // Implemented in task 2.4
}

export async function checkStreakBadges(userId) {
  // Implemented in task 2.4
}

export async function checkCoinsEarnedBadges(userId) {
  // Implemented in task 2.6
}

export async function checkCoinsSpentBadges(userId) {
  // Implemented in task 2.6
}

export async function checkLikeBadges(userId) {
  // Implemented in task 2.6
}

export async function checkCommentBadges(userId) {
  // Implemented in task 2.6
}

export async function checkReferralBadges(userId) {
  // Implemented in task 2.6
}

export async function checkLevelBadges(userId) {
  // Implemented in task 2.6
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Check and award badges for a given trigger.
 * Never throws — always resolves.
 */
export async function checkAchievements(userId, trigger) {
  try {
    switch (trigger) {
      case 'post_created':      await checkPostingBadges(userId);      break
      case 'follower_gained':   await checkFollowerBadges(userId);     break
      case 'streak_updated':    await checkStreakBadges(userId);       break
      case 'coins_earned':      await checkCoinsEarnedBadges(userId);  break
      case 'coins_spent':       await checkCoinsSpentBadges(userId);   break
      case 'like_received':     await checkLikeBadges(userId);         break
      case 'comment_received':  await checkCommentBadges(userId);      break
      case 'referral_made':     await checkReferralBadges(userId);     break
      case 'level_up':          await checkLevelBadges(userId);        break
      default:                  break // unknown triggers silently ignored
    }
  } catch (err) {
    console.error('[Achievements] checkAchievements error:', err)
  }
}
