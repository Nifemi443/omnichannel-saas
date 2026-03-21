// In-memory sliding window rate limiter.
// Works correctly for single-instance deployments (local dev, single Vercel function).
//
// TODO: Replace the `store` Map with Upstash Redis before scaling beyond one instance.
// Upstash drop-in: https://upstash.com/docs/redis/sdks/ratelimit
// In serverless/edge environments each cold start gets a fresh Map, so this
// WILL NOT enforce limits across concurrent Vercel function instances in production.

type RateLimitEntry = { timestamps: number[] }

export type RateLimitResult =
  | { success: true;  remaining: number; resetIn: number }
  | { success: false; remaining: 0;      resetIn: number }

// Single shared store — survives across requests within the same process.
const store = new Map<string, RateLimitEntry>()

function createRateLimiter(limit: number, windowMs: number) {
  return function check(identifier: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - windowMs

    // Rehydrate entry and evict stale timestamps for this key
    const entry = store.get(identifier) ?? { timestamps: [] }
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    // Periodic cleanup: remove all fully-expired entries from the Map to
    // prevent unbounded memory growth under high unique-user traffic.
    for (const [key, val] of store) {
      if (val.timestamps.length === 0 || val.timestamps[val.timestamps.length - 1] <= windowStart) {
        store.delete(key)
      }
    }

    if (entry.timestamps.length >= limit) {
      return {
        success: false,
        remaining: 0,
        resetIn: entry.timestamps[0] + windowMs - now,
      }
    }

    entry.timestamps.push(now)
    store.set(identifier, entry)

    return {
      success: true,
      remaining: limit - entry.timestamps.length,
      resetIn: entry.timestamps[0] + windowMs - now,
    }
  }
}

// ── Pre-configured instances ──────────────────────────────────────────────────

/** General-purpose API rate limit: 60 requests per minute */
export const apiLimiter = createRateLimiter(60, 60_000)

/** AI generation rate limit: 5 requests per minute (expensive — guard tightly) */
export const generateLimiter = createRateLimiter(5, 60_000)

// ── Plan-aware helper (used by api-middleware) ─────────────────────────────────

const PLAN_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  free: { requests: 10, windowMs: 60_000 },
  pro:  { requests: 60, windowMs: 60_000 },
}

export function checkRateLimit(key: string, plan: string): RateLimitResult {
  const { requests, windowMs } = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
  return createRateLimiter(requests, windowMs)(key)
}
