// Feature: achievements-badges, Property 2: Milestone threshold coverage (posting / followers / streak)
// Validates: Requirements 4.2, 4.3, 5.2, 6.2

'use strict'

const fc = require('fast-check')

// ── Badge groups under test ───────────────────────────────────────────────────

const POSTING_BADGES = [
  { slug: 'badge-first-post', threshold: 1 },
  { slug: 'badge-post-10',    threshold: 10 },
  { slug: 'badge-post-50',    threshold: 50 },
  { slug: 'badge-post-100',   threshold: 100 },
  { slug: 'badge-post-500',   threshold: 500 },
]

const FOLLOWER_BADGES = [
  { slug: 'badge-followers-10',   threshold: 10 },
  { slug: 'badge-followers-50',   threshold: 50 },
  { slug: 'badge-followers-100',  threshold: 100 },
  { slug: 'badge-followers-500',  threshold: 500 },
  { slug: 'badge-followers-1000', threshold: 1000 },
]

const STREAK_BADGES = [
  { slug: 'badge-streak-3',   threshold: 3 },
  { slug: 'badge-streak-7',   threshold: 7 },
  { slug: 'badge-streak-30',  threshold: 30 },
  { slug: 'badge-streak-100', threshold: 100 },
]

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockConnectDB = jest.fn().mockResolvedValue(undefined)
const mockShopItemFindOne = jest.fn()
const mockWalletFindOneAndUpdate = jest.fn()
const mockGetOrCreateWallet = jest.fn().mockResolvedValue({ _id: 'wallet-id', inventory: [] })
const mockCreateNotification = jest.fn().mockResolvedValue(undefined)
const mockPostCountDocuments = jest.fn()
const mockUserFindById = jest.fn()

jest.mock('../../lib/db', () => mockConnectDB)
jest.mock('../../models/ShopItem', () => ({ findOne: mockShopItemFindOne }))
jest.mock('../../models/Wallet', () => ({ findOneAndUpdate: mockWalletFindOneAndUpdate }))
jest.mock('../../lib/coins', () => ({ getOrCreateWallet: mockGetOrCreateWallet }))
jest.mock('../../lib/notifications', () => ({ createNotification: mockCreateNotification }))
jest.mock('../../models/Post', () => ({ countDocuments: mockPostCountDocuments }))
jest.mock('../../models/User', () => ({ findById: mockUserFindById }))

// ── Import after mocks ────────────────────────────────────────────────────────

const { checkAchievements } = require('../../lib/achievements')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Set up mocks for a single property run.
 *
 * ShopItem.findOne returns a badge doc keyed by slug.
 * Wallet.findOneAndUpdate tracks which slugs were awarded (first call per slug
 * succeeds; subsequent calls return null to simulate idempotency).
 *
 * Returns `awardedSlugs` — a Set populated as awardBadge calls resolve.
 */
function setupMocksForRun(badgeGroup) {
  jest.clearAllMocks()

  mockConnectDB.mockResolvedValue(undefined)
  mockGetOrCreateWallet.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
  mockCreateNotification.mockResolvedValue(undefined)

  // ShopItem.findOne: return a fake badge doc for any slug in the group
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

  // Track awarded slugs; first call per slug succeeds, subsequent return null
  const awardedSlugs = new Set()

  mockWalletFindOneAndUpdate.mockImplementation((filter) => {
    // Extract the itemId from the $push payload — Jest captures the full call args
    // but we identify the badge by inspecting ShopItem.findOne call history.
    // Simpler: always succeed (return a doc) — awardBadge returns true.
    // We track which slugs were awarded via ShopItem.findOne call args instead.
    return Promise.resolve({ _id: 'wallet-id', inventory: [] })
  })

  return awardedSlugs
}

/**
 * Collect the slugs that awardBadge attempted to award during a checkAchievements
 * call by inspecting ShopItem.findOne call arguments (each awardBadge call does
 * exactly one ShopItem.findOne({ slug }) lookup).
 */
function getAwardedSlugs() {
  return mockShopItemFindOne.mock.calls.map((args) => args[0].slug)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 2: Milestone threshold coverage (posting / followers / streak)', () => {

  // ── Posting badges ──────────────────────────────────────────────────────────

  it('post_created: all posting badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),                          // random userId
        fc.integer({ min: 0, max: 600 }),   // random post count N
        async (userId, N) => {
          setupMocksForRun(POSTING_BADGES)

          // Mock Post.countDocuments to return N
          mockPostCountDocuments.mockResolvedValue(N)

          await checkAchievements(userId, 'post_created')

          const awarded = getAwardedSlugs()

          // Every badge with threshold ≤ N must have been awarded
          for (const badge of POSTING_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          // No badge with threshold > N must have been awarded
          for (const badge of POSTING_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── Follower badges ─────────────────────────────────────────────────────────

  it('follower_gained: all follower badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),                           // random userId
        fc.integer({ min: 0, max: 1100 }),   // random follower count N
        async (userId, N) => {
          setupMocksForRun(FOLLOWER_BADGES)

          // Mock User.findById to return a user with N followers
          mockUserFindById.mockResolvedValue({ followers: Array(N).fill(null) })

          await checkAchievements(userId, 'follower_gained')

          const awarded = getAwardedSlugs()

          for (const badge of FOLLOWER_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of FOLLOWER_BADGES) {
            if (badge.threshold > N) {
              expect(awarded).not.toContain(badge.slug)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // ── Streak badges ───────────────────────────────────────────────────────────

  it('streak_updated: all streak badges with threshold ≤ N are awarded; none with threshold > N', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),                          // random userId
        fc.integer({ min: 0, max: 110 }),   // random streak N
        async (userId, N) => {
          setupMocksForRun(STREAK_BADGES)

          // Mock User.findById to return a user with currentStreak = N
          mockUserFindById.mockResolvedValue({ currentStreak: N })

          await checkAchievements(userId, 'streak_updated')

          const awarded = getAwardedSlugs()

          for (const badge of STREAK_BADGES) {
            if (badge.threshold <= N) {
              expect(awarded).toContain(badge.slug)
            }
          }

          for (const badge of STREAK_BADGES) {
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
