import { NextResponse } from 'next/server'
import { getRedis, isRedisAvailable } from './redis'
import { getClientIP } from './utils'

const inMemoryRateLimit = new Map()

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 100,
}

function cleanOldInMemoryEntries(store, windowStart) {
  for (const [key, data] of store.entries()) {
    if (data.windowStart < windowStart) {
      store.delete(key)
    }
  }
}

export async function rateLimit(ip, key, limit, windowMs) {
  const fullKey = `ratelimit:${key}:${ip}`

  if (isRedisAvailable()) {
    const redis = getRedis()
    const now = Date.now()
    const windowKey = `${fullKey}:${Math.floor(now / windowMs)}`

    const requests = await redis.incr(windowKey)
    if (requests === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000) + 1)
    }

    if (requests > limit) {
      const ttl = await redis.ttl(windowKey)
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl > 0 ? ttl : Math.ceil(windowMs / 1000)
      }
    }

    return {
      allowed: true,
      remaining: limit - requests,
      retryAfter: 0
    }
  }

  const now = Date.now()
  const windowStart = now - windowMs

  cleanOldInMemoryEntries(inMemoryRateLimit, windowStart)

  if (!inMemoryRateLimit.has(fullKey)) {
    inMemoryRateLimit.set(fullKey, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  const entry = inMemoryRateLimit.get(fullKey)
  entry.count++

  if (entry.count > limit) {
    const retryAfter = Math.ceil(windowMs / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 }
}

export async function applyRateLimit(request, key, limit, windowMs) {
  const ip = getClientIP(request)
  const result = await rateLimit(ip, key, limit, windowMs)

  if (!result.allowed) {
    return {
      blocked: true,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Limit': String(limit)
          }
        }
      )
    }
  }

  return { blocked: false, remaining: result.remaining }
}

export async function checkRateLimit(ip, key, limit, windowMs) {
  const result = await rateLimit(ip, key, limit, windowMs)
  return result.allowed
}
