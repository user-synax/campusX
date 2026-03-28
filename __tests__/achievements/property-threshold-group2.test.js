// Feature: achievements-badges, Property 2: Milestone threshold coverage (economy / engagement / referral / level)
// Validates: Requirements 7.2, 7.4, 8.2, 8.4, 9.2, 10.2

'use strict'

const fc = require('fast-check')

// ── Badge groups under test ───────────────────────────────────────────────────

const COINS_EARNED_BADGES = [
  { slug: 'badge-coins-100',  threshold: 100 },
  { slug: 'badge-coins-1000', threshold: 1000 },
  // badge-whale (@10000) is intentionally excluded — handled by awardWhaleBadge()
]

const COINS_SPENT_BADGES = [
  { slug: 'badge-spender-500',  threshold: 500 },
  { slug: 'badge-spender-5000', threshold: 5000 },
]

const LIKE_RECEIVED_BADGES = [
  { slug: 'badge-likes-10',  threshold: 10 },
  { slug: 'badge-likes-100', threshold: 100 },
  { slug: 'badge-likes-500', threshold: 500 },
]

const COMMENT_RECEIVED_BADGES = [
  { slug: 'badge-comments-10', threshold: 10 },
  { slug: 'badge-comments-50', threshold: 50 },
]

const REFERRAL_BADGES = [
  { slug: 'badge-referral-1',  threshold: 1 },
  { slug: 'badge-referral-5',  threshold: 5 },
  { slug: 'badge-referral-10', threshold: 10 },
]

const LEVEL_BADGES = [
  { slug: 'badge-level-10', threshold: 10 },
  { slug: 'badge-level-25', threshold: 25 },
  { slug: 'badge-level-50', threshold: 50 },
]

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockConnectDB = jest.fn().mockResolvedValue(undefined)
const mockShopItemFindOne = jest.fn()
const mockWalletFindOne = jest.fn()
const mockWalletFindOneAndUpdate = jest.fn()
const mockGetOrCreateWallet = jest.fn().mockResolvedValue({ _id: 'wallet-id', inventory: [] })
const mockCreateNotification = jest.fn().mockResolvedValue(undefined)
const mockPostAggregate = jest.fn()
const mockUserFindById = jest.fn()

jest.mock('../../lib/db', () => mockConnectDB)
jest.mock('../../models/ShopItem', () => ({ findOne: mockShopItemFindOne }))
jest.mock('../../models/Wallet', () => ({
  findOne: mockWalletFindOne,
  findOneAndUpdate: mockWalletFindOneAndUpdate,
}))
jest.mock('../../lib/coins', () => ({ getOrCreateWallet: mockGetOrCreateWallet }))
jest.mock('../../lib/notifications', () => ({ createNotification: mockCreateNotification }))
jest.mock('../../models/Post', () => ({ aggregate: mockPostAggregate }))
jest.mock('../../models/User', () => ({ findById: mockUserFindById }))

// ── Import after mocks ────────────────────────────────────────────────────────

const { checkAchievements } = require('../../lib/achievements')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Set up common mocks for a single property run.
 * ShopItem.findOne returns a fake badge doc for any slug in the given group.
 * Wallet.findOneAndUpdate always succeeds (returns a doc).
 */
function setupMocksForRun(badgeGroup) {
  jest.clearAllMocks()

  mockConnectDB.mockResolvedValue(undefined)
  mockGetOrCreateWallet.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
  mockCreateNotification.mockResolvedValue(undefined)

  mockShopItemFindOne.mockImplementation(({ slug }) => {
    const badge = badgeGroup.find((b) => b.slug === slug)
    if (!badge) return Promise.resolve(null)
    return Promise.resolve({
      _id: `id-${slug}`,
      slug,
      name: slug,
      visual: { emoji: '🏅' },
    })
  })

  mockWalletFindOneAndUpdate.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
}

/**
 * Collect the slugs that awardBadge attempted to award by inspecting
 * ShopItem.findOne call arguments (each awardBadge call does exactly one
 * ShopItem.findOne({ slug }) lookup).
 */
function getAwardedSlugs() {
  return mockShopItemFindOne.mock.calls.map((args) => args[0].slug)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 2: Milestone threshold coverage (economy / engagement / referral / level)', () => {

  // ── coins_earned ────────────────────────────────────────────────────────────

  it('coins_earned: all coins-earned badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 1100 }),
        async (userId, N) => {
          setupMocksForRun(COINS_EARNED_BADGES)

          // checkCoinsEarnedBadges reads totalEarned via Wallet.findOne
          mockWalletFindOne.mockResolvedValue({ totalEarned: N })

          await checkAchievements(userId, 'coins_earned')

          const awarded = getAwardedSlugs()

          for (const badge of COINS_EARNED_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of COINS_EARNED_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── coins_spent ─────────────────────────────────────────────────────────────

  it('coins_spent: all coins-spent badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 5100 }),
        async (userId, N) => {
          setupMocksForRun(COINS_SPENT_BADGES)

          // checkCoinsSpentBadges reads totalSpent via Wallet.findOne
          mockWalletFindOne.mockResolvedValue({ totalSpent: N })

          await checkAchievements(userId, 'coins_spent')

          const awarded = getAwardedSlugs()

          for (const badge of COINS_SPENT_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of COINS_SPENT_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── like_received ───────────────────────────────────────────────────────────

  it('like_received: all like badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 600 }),
        async (userId, N) => {
          setupMocksForRun(LIKE_RECEIVED_BADGES)

          // checkLikeBadges aggregates sum(likesCount) via Post.aggregate
          mockPostAggregate.mockResolvedValue([{ total: N }])

          await checkAchievements(userId, 'like_received')

          const awarded = getAwardedSlugs()

          for (const badge of LIKE_RECEIVED_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of LIKE_RECEIVED_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── comment_received ────────────────────────────────────────────────────────

  it('comment_received: all comment badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 60 }),
        async (userId, N) => {
          setupMocksForRun(COMMENT_RECEIVED_BADGES)

          // checkCommentBadges aggregates sum(commentsCount) via Post.aggregate
          mockPostAggregate.mockResolvedValue([{ total: N }])

          await checkAchievements(userId, 'comment_received')

          const awarded = getAwardedSlugs()

          for (const badge of COMMENT_RECEIVED_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of COMMENT_RECEIVED_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── referral_made ───────────────────────────────────────────────────────────

  it('referral_made: all referral badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 12 }),
        async (userId, N) => {
          setupMocksForRun(REFERRAL_BADGES)

          // checkReferralBadges reads referralCount via User.findById
          mockUserFindById.mockResolvedValue({ referralCount: N })

          await checkAchievements(userId, 'referral_made')

          const awarded = getAwardedSlugs()

          for (const badge of REFERRAL_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of REFERRAL_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── level_up ────────────────────────────────────────────────────────────────

  it('level_up: all level badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 0, max: 55 }),
        async (userId, N) => {
          setupMocksForRun(LEVEL_BADGES)

          // checkLevelBadges reads level via User.findById
          mockUserFindById.mockResolvedValue({ level: N })

          await checkAchievements(userId, 'level_up')

          const awarded = getAwardedSlugs()

          for (const badge of LEVEL_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of LEVEL_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
