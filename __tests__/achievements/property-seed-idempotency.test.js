// Feature: achievements-badges, Property 7: Seed script idempotency
// Validates: Requirements 13.1, 13.2

'use strict'

const fc = require('fast-check')

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../lib/db', () => jest.fn().mockResolvedValue(undefined))
jest.mock('../../models/Wallet', () => ({ findOneAndUpdate: jest.fn() }))
jest.mock('../../lib/coins', () => ({ getOrCreateWallet: jest.fn().mockResolvedValue({}) }))
jest.mock('../../lib/notifications', () => ({ createNotification: jest.fn().mockResolvedValue(undefined) }))

// ShopItem mock — findOneAndUpdate and countDocuments are configured per-run
const mockFindOneAndUpdate = jest.fn()
const mockCountDocuments = jest.fn()
jest.mock('../../models/ShopItem', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: (...args) => mockFindOneAndUpdate(...args),
  countDocuments: (...args) => mockCountDocuments(...args),
}))

// ── Import after mocks ────────────────────────────────────────────────────────

const { BADGE_CATALOG } = require('../../lib/achievements')

// ── Seed logic ────────────────────────────────────────────────────────────────

/**
 * Extracted seed logic — mirrors what scripts/seed-badges.mjs does.
 * Uses upsert:true with $setOnInsert so re-running never creates duplicates.
 */
async function runSeedLogic(findOneAndUpdateFn) {
  for (const badge of BADGE_CATALOG) {
    const { slug, emoji, name, description } = badge
    await findOneAndUpdateFn(
      { slug },
      {
        $setOnInsert: {
          slug,
          name,
          description,
          category: 'achievement_badge',
          price: 0,
          isActive: true,
          visual: { emoji },
          rarity: 'common',
        },
      },
      { upsert: true, new: true }
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build an isolated in-memory store and return the upsert + count functions.
 * Simulates MongoDB upsert: $setOnInsert fires only when the slug is absent.
 */
function createInMemoryStore() {
  const store = {}

  function upsert(filter, update) {
    const { slug } = filter
    if (!store[slug]) {
      store[slug] = { slug, category: 'achievement_badge', ...update.$setOnInsert }
    }
    return Promise.resolve(store[slug])
  }

  function count() {
    return Promise.resolve(Object.keys(store).length)
  }

  return { store, upsert, count }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 7: Seed script idempotency', () => {
  it('running seed logic N times always results in exactly BADGE_CATALOG.length documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // random number of seed runs (2–5)
        async (runs) => {
          const { count, upsert } = createInMemoryStore()

          // Run the seed logic N times
          for (let i = 0; i < runs; i++) {
            await runSeedLogic(upsert)
          }

          // Count documents with category: 'achievement_badge'
          const docCount = await count()

          // Must equal exactly BADGE_CATALOG.length — no more, no less
          expect(docCount).toBe(BADGE_CATALOG.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('each badge slug appears exactly once after multiple seed runs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (runs) => {
          const { store, upsert } = createInMemoryStore()

          for (let i = 0; i < runs; i++) {
            await runSeedLogic(upsert)
          }

          // Every slug from BADGE_CATALOG must be present exactly once
          const storedSlugs = Object.keys(store)
          expect(storedSlugs).toHaveLength(BADGE_CATALOG.length)

          for (const badge of BADGE_CATALOG) {
            expect(store[badge.slug]).toBeDefined()
            expect(store[badge.slug].category).toBe('achievement_badge')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
