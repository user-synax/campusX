const store = new Map() 
 
export function setCache(key, value, ttlSeconds = 60) { 
  store.set(key, { 
    value, 
    expiresAt: Date.now() + ttlSeconds * 1000 
  }) 
} 
 
export function getCache(key) { 
  const entry = store.get(key) 
  if (!entry) return null 
  if (Date.now() > entry.expiresAt) { 
    store.delete(key) 
    return null 
  } 
  return entry.value 
} 
 
export function deleteCache(key) { 
  store.delete(key) 
} 
 
export function deleteCachePattern(prefix) { 
  // Delete all keys starting with prefix 
  for (const key of store.keys()) { 
    if (key.startsWith(prefix)) store.delete(key) 
  } 
} 
 
// Cache wrapper — fetch from cache or run fn 
export async function withCache(key, ttlSeconds, fn) { 
  const cached = getCache(key) 
  if (cached !== null) return cached 
  const result = await fn() 
  setCache(key, result, ttlSeconds) 
  return result 
} 
