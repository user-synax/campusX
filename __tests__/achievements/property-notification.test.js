// Feature: achievements-badges, Property 4: Notification on new award only
// Validates: Requirements 3.1, 3.2, 3.4

'use strict'

const fc = require('fast-check')

// ── Mocks ─────────────────────────────────────────────────────────────────────

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
 * Reset mock state and configure mocks for a single property run.
 * First call to Wallet.findOneAndUpdate returns a modified doc (badge awarded).
 * Second call returns null (badge already owned — $ne filter does not match).
 */
function setupMocksForRun(badgeId, slug) {
    jest.clearAllMocks()

    mockConnectDB.mockResolvedValue(undefined)
    mockGetOrCreateWallet.mockResolvedValue({ _id: 'wallet-id', inventory: [] })
    mockCreateNotification.mockResolvedValue(undefined)

    mockShopItemFindOne.mockResolvedValue({
        _id: badgeId,
        slug,
        name: `Badge ${slug}`,
        visual: { emoji: '🏆' },
    })

    let callCount = 0
    mockWalletFindOneAndUpdate.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
            // First call — badge not yet owned → simulate successful award
            return Promise.resolve({
                _id: 'wallet-id',
                inventory: [{ itemId: badgeId, purchasedAt: new Date() }],
            })
        }
        // Subsequent calls — badge already in inventory → $ne filter misses → null
        return Promise.resolve(null)
    })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 4: Notification on new award only', () => {
    it('createNotification is called exactly once after two awardBadge calls, with correct meta.badgeSlug', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.uuid(),                                    // random userId
                fc.stringMatching(/^[a-z][a-z0-9-]{2,19}$/), // random badge slug
                async (userId, slug) => {
                    const badgeId = `badge-id-${slug}`

                    setupMocksForRun(badgeId, slug)

                    // First call — badge is newly awarded
                    const firstResult = await awardBadge(userId, slug)
                    expect(firstResult).toBe(true)

                    // Second call — badge already owned, no new award
                    const secondResult = await awardBadge(userId, slug)
                    expect(secondResult).toBe(false)

                    // createNotification must have been called exactly once
                    expect(mockCreateNotification).toHaveBeenCalledTimes(1)

                    // The notification meta.badgeSlug must match the slug
                    const [notifArg] = mockCreateNotification.mock.calls[0]
                    expect(notifArg.type).toBe('achievement')
                    expect(notifArg.meta.badgeSlug).toBe(slug)
                }
            ),
            { numRuns: 100 }
        )
    })
})
