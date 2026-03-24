import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROWTH METRIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Compute percentage growth between two periods.
 * @param {number} current - value in current period
 * @param {number} previous - value in previous period
 * @returns {number} rounded percentage change
 */
export function computeGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROWTH COLOR CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns Tailwind color class for a growth value.
 * @param {number} growth
 * @returns {string}
 */
export function getGrowthColorClass(growth) {
    if (growth > 0) return 'text-green-400'
    if (growth < 0) return 'text-red-400'
    return 'text-muted-foreground'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE RANGE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_RANGES = ['7d', '30d', '90d', 'all']

/**
 * Returns milliseconds for a given range string.
 * @param {string} range
 * @returns {number|null} null for 'all'
 */
export function getRangeDuration(range) {
    const map = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        'all': null,
    }
    const key = VALID_RANGES.includes(range) ? range : '30d'
    return map[key]
}

/**
 * Returns a MongoDB $match createdAt filter object for the given range.
 * Returns {} for 'all' (no date filter).
 * Invalid ranges default to '30d'.
 * @param {string} range
 * @returns {{ createdAt?: { $gte: Date } }}
 */
export function applyDateFilter(range) {
    const duration = getRangeDuration(range)
    if (duration === null) return {}
    return { createdAt: { $gte: new Date(Date.now() - duration) } }
}

/**
 * Returns start date for a range (or null for 'all').
 * @param {string} range
 * @returns {Date|null}
 */
export function getRangeStartDate(range) {
    const duration = getRangeDuration(range)
    if (duration === null) return null
    return new Date(Date.now() - duration)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOP-N RANKING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns top N items from an array sorted by field descending.
 * @param {object[]} items
 * @param {string} field
 * @param {number} n
 * @returns {object[]}
 */
export function computeTopN(items, field, n) {
    if (!Array.isArray(items) || n <= 0) return []
    return [...items]
        .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))
        .slice(0, n)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROUP BY FIELD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Groups an array of objects by a field, counts per group,
 * sorts descending, returns top `limit` entries.
 * @param {object[]} items
 * @param {string} field
 * @param {number} limit
 * @returns {{ [field]: string, count: number }[]}
 */
export function groupByField(items, field, limit) {
    if (!Array.isArray(items)) return []
    const counts = {}
    for (const item of items) {
        const key = item[field] ?? ''
        counts[key] = (counts[key] ?? 0) + 1
    }
    return Object.entries(counts)
        .map(([key, count]) => ({ [field]: key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIME SERIES BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Takes aggregation output `[{ date: 'YYYY-MM-DD', count: number }]`
 * and fills in zero-count days between startDate and endDate.
 * Returns array sorted ascending by date.
 * @param {Array<{date: string, count: number}>} docs
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array<{date: string, count: number}>}
 */
export function buildTimeSeries(docs, startDate, endDate) {
    if (!startDate || !endDate) return docs ?? []

    const lookup = {}
    for (const d of (docs ?? [])) {
        lookup[d.date] = d.count
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    return days.map(day => {
        const key = format(day, 'yyyy-MM-dd')
        return { date: key, count: lookup[key] ?? 0 }
    })
}
