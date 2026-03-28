// Feature: achievements-badges, Property 5: Error non-propagation
// Validates: Requirements 2.4, 3.3, 12.3

'use strict'

const fc = require('fast-check')

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockConnectDB = jest.fn()
const mockShopItemFindOne = jest.fn()
const mockWalletFindOneAndUpdate = jest.fn()
const mockGetOrCreateWallet = jest.fn()
const mockCreateNotification = jest.fn()

// Models used by per-trigger checkers (checkPostingBadges, etc.)
const mockUserFindOne = jest.fn()
const mockPostCountDocuments = jest.fn()
const mockPostAggregate = jest.fn()
const mockWalletFindOne = jest.fn()

jest.mock('../../lib/db', () => mockConnectDB)
jest.mock('../../models/ShopItem', () => ({ findOne: mockShopItemFindOne }))
jest.mock('../../models/Wallet', () => ({
  findOneAndUpdate: mockWalletFindOneAndUpdate,
  findOne: mockWalletFindOne,
}))
jest.mock('../../lib/coins', () => ({ getOrCreateWallet: mockGetOrCreateWallet }))
jest.mock('../../lib/notifications', () => ({ createNotification: mockCreateNotification }))
jest.mock('../../models/User', () => ({ findOne: mockUserFindOne }))
jest.mock('../../models/Post', () => ({
  countDocuments: mockPostCountDocuments,
  aggregate: mockPostAggregate,
}))

// ── Import after mocks ────────────────────────────────────────────────────────

const { checkAchievements } = require('../../lib/achievements')

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Configure all DB mocks to throw errors, simulating DB failures. */
function setupAllMocksToThrow() {
  jest.clearAllMocks()
  const dbError = new Error('Simulated DB failure')
  mockConnectDB.mockRejectedValue(dbError)
  mockShopItemFindOne.mockRejectedValue(dbError)
  mockWalletFindOneAndUpdate.mockRejectedValue(dbError)
  mockGetOrCreateWallet.mockRejectedValue(dbError)
  mockCreateNotification.mockRejectedValue(dbError)
  mockUserFindOne.mockRejectedValue(dbError)
  mockPostCountDocuments.mockRejectedValue(dbError)
  mockPostAggregate.mockRejectedValue(dbError)
  mockWalletFindOne.mockRejectedValue(dbError)
}

/** Configure all DB mocks to resolve normally (happy path). */
function setupAllMocksToResolve() {
  jest.clearAllMocks()
  mockConnectDB.mockResolvedValue(undefined)
  mockShopItemFindOne.mockResolvedValue(null)
  mockWalletFindOneAndUpdate.mockResolvedValue(null)
  mockGetOrCreateWallet.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
  mockCreateNotification.mockResolvedValue(undefined)
  mockUserFindOne.mockResolvedValue({ followers: [], currentStreak: 0, level: 0, referralCount: 0 })
  mockPostCountDocuments.mockResolvedValue(0)
  mockPostAggregate.mockResolvedValue([])
  mockWalletFindOne.mockResolvedValue({ totalEarned: 0, totalSpent: 0 })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

const KNOWN_TRIGGERS = [
  'post_created',
  'follower_gained',
  'streak_updated',
  'coins_earned',
  'coins_spent',
  'like_received',
  'comment_received',
  'referral_made',
  'level_up',
]

describe('Property 5: Error non-propagation', () => {
  it('checkAchievements always resolves with null/undefined userId and garbage trigger strings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // garbage trigger string
        async (garbageTrigger) => {
          setupAllMocksToResolve()

          // null userId + garbage trigger
          await expect(checkAchievements(null, garbageTrigger)).resolves.not.toThrow()
          // undefined userId + garbage trigger
          await expect(checkAchievements(undefined, garbageTrigger)).resolves.not.toThrow()
          // empty string userId + garbage trigger
          await expect(checkAchievements('', garbageTrigger)).resolves.not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('checkAchievements always resolves when DB throws errors (valid userId + known triggers)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),                                          // valid userId
        fc.constantFrom(...KNOWN_TRIGGERS),                 // known trigger
        async (userId, trigger) => {
          setupAllMocksToThrow()

          await expect(checkAchievements(userId, trigger)).resolves.not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('checkAchievements always resolves when DB throws errors (valid userId + garbage trigger)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),   // valid userId
        fc.string(), // garbage trigger
        async (userId, garbageTrigger) => {
          setupAllMocksToThrow()

          await expect(checkAchievements(userId, garbageTrigger)).resolves.not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })
})
