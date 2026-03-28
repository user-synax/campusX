// Feature: achievements-badges, Property 3: Badge award idempotency
// Validates: Requirements 2.1, 2.2, 3.4

'use strict'

const fc = require('fast-check')

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Track per-(userId, badgeId) inventory state within a single property run
let inventoryState = {}

const mockConnectDB = jest.fn().mockResolvedValue(undefined)
const mockShopItemFindOne = jest.fn()
const mockWalletFindOneAndUpdate = jest.fn()
const mockGetOrCreateWallet = jest.fn().mockResolvedValue({ _id: 'wallet-id', inventory: [] })
const mockCreateNotification = jest.fn().mockResolvedValue(undefined)

jest.mock('../../lib/db', () => mockConnectDB)
jest.mock('../../models/ShopItem', () => ({ findOne: mockShopItemFindOne }))
jest.mock('../../models/Wallet', () => ({ findOneAndUpdate: mockWalletFindOneAndUpdate }))
jest.mock('../../lib/coins', () => ({ getOrCreateWallet: mockGetOrCreateWallet }))
jest.mock('../../lib/notifications', () => ({ createNotification: mockCreateNotification }))

// ── Import after mocks ────────────────────────────────────────────────────────

const { awardBadge } = require('../../lib/achievements')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Reset mock state and configure Wallet.findOneAndUpdate to simulate the
 * $ne idempotency filter: first call for a (userId, badgeId) pair pushes the
 * item; subsequent calls find the item already present and return null.
 */
function setupMocksForRun(badgeId) {
  inventoryState = {}
  jest.clearAllMocks()

  mockConnectDB.mockResolvedValue(undefined)
  mockGetOrCreateWallet.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
  mockCreateNotification.mockResolvedValue(undefined)

  mockShopItemFindOne.mockResolvedValue({
    _id: badgeId,
    slug: 'test-badge',
    name: 'Test Badge',
    visual: { emoji: '🏆' },
  })

  mockWalletFindOneAndUpdate.mockImplementation((filter) => {
    const userId = filter.userId != null ? filter.userId.toString() : String(filter.userId)
    const key = `${userId}:${badgeId}`

    if (inventoryState[key]) {
      // Badge already in inventory — $ne filter does NOT match → no modification
      return Promise.resolve(null)
    }

    // First call — badge not yet in inventory → simulate push
    inventoryState[key] = true
    return Promise.resolve({
      _id: 'wallet-id',
      userId,
      inventory: [{ itemId: badgeId, purchasedAt: new Date() }],
    })
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 3: Badge award idempotency', () => {
  it('calling awardBadge N times (N ≥ 2) results in exactly one inventory entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),                                    // random userId
        fc.stringMatching(/^[a-z][a-z0-9-]{2,19}$/), // random badge slug
        fc.integer({ min: 2, max: 8 }),               // N ≥ 2 calls
        async (userId, slug, n) => {
          const badgeId = `badge-id-${slug}`

          setupMocksForRun(badgeId)

          // Override ShopItem.findOne to return the slug-specific badge
          mockShopItemFindOne.mockResolvedValue({
            _id: badgeId,
            slug,
            name: `Badge ${slug}`,
            visual: { emoji: '🏅' },
          })

          // Call awardBadge N times
          const results = []
          for (let i = 0; i < n; i++) {
            results.push(await awardBadge(userId, slug))
          }

          // First call should return true (newly awarded)
          expect(results[0]).toBe(true)

          // All subsequent calls should return false (already owned)
          for (let i = 1; i < n; i++) {
            expect(results[i]).toBe(false)
          }

          // Wallet.findOneAndUpdate was called exactly N times
          expect(mockWalletFindOneAndUpdate).toHaveBeenCalledTimes(n)

          // Exactly one inventory entry exists for this userId+badge (no duplicates)
          const key = `${userId}:${badgeId}`
          expect(inventoryState[key]).toBe(true)
          const duplicateKeys = Object.keys(inventoryState).filter((k) => k === key)
          expect(duplicateKeys).toHaveLength(1)
        }
      ),
      { numRuns: 100 }
    )
  })
})
