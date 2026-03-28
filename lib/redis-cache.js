import { getRedis, isRedisAvailable } from './redis'

const inMemoryStore = new Map()

function cleanExpiredInMemory(store) {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key)
    }
  }
}

export async function cacheGet(key) {
  if (isRedisAvailable()) {
    const redis = getRedis()
    const data = await redis.get(key)
    return data ?? null
  }

  cleanExpiredInMemory(inMemoryStore)
  const entry = inMemoryStore.get(key)
  if (!entry || entry.expiresAt <= Date.now()) {
    inMemoryStore.delete(key)
    return null
  }
  return entry.value
}

export async function cacheSet(key, value, ttlSeconds = 60) {
  if (isRedisAvailable()) {
    const redis = getRedis()
    await redis.set(key, value, { ex: ttlSeconds })
    return
  }

  inMemoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  })
}

export async function cacheDel(key) {
  if (isRedisAvailable()) {
    const redis = getRedis()
    await redis.del(key)
    return
  }

  inMemoryStore.delete(key)
}

export async function cacheDelPattern(pattern) {
  if (isRedisAvailable()) {
    const redis = getRedis()
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return
  }

  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  for (const key of inMemoryStore.keys()) {
    if (regex.test(key)) {
      inMemoryStore.delete(key)
    }
  }
}

export async function cacheWithFallback(key, ttlSeconds, fn) {
  const cached = await cacheGet(key)
  if (cached !== null) return cached

  const result = await fn()
  if (result !== null && result !== undefined) {
    await cacheSet(key, result, ttlSeconds)
  }
  return result
}
