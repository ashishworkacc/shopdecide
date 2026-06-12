import { LRUCache } from 'lru-cache'
import crypto from 'crypto'

interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new LRUCache<string, CacheEntry>({
  max: 200,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
})

export function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s₹]/g, '')
}

export function cacheKey(q: string): string {
  return crypto.createHash('sha256').update(normalizeQuery(q)).digest('hex')
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  return entry.data as T
}

export function setCached(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function getCachedTimestamp(key: string): number | null {
  return cache.get(key)?.timestamp ?? null
}
