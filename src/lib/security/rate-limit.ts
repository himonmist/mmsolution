/**
 * Fixed-window in-memory rate limiter. Suitable for a single Node instance.
 * For multi-instance deployments, swap the store for Redis (same interface).
 */
type Entry = { count: number; resetAt: number };

export class RateLimiter {
  private store = new Map<string, Entry>();
  constructor(private opts: { limit: number; windowMs: number; maxKeys?: number }) {}

  hit(key: string, now = Date.now()): { allowed: boolean; remaining: number; retryAfterMs: number } {
    let e = this.store.get(key);
    if (!e || now >= e.resetAt) {
      e = { count: 0, resetAt: now + this.opts.windowMs };
      this.store.delete(key);
      this.store.set(key, e);
      this.evict(now);
    }
    e.count++;
    const allowed = e.count <= this.opts.limit;
    return { allowed, remaining: Math.max(0, this.opts.limit - e.count), retryAfterMs: allowed ? 0 : e.resetAt - now };
  }

  reset(key: string) { this.store.delete(key); }
  size() { return this.store.size; }

  private evict(now: number) {
    const max = this.opts.maxKeys ?? 10_000;
    if (this.store.size <= max) return;
    for (const [k, v] of this.store) {
      if (v.resetAt <= now || this.store.size > max) this.store.delete(k);
      if (this.store.size <= max) break;
    }
  }
}

const g = globalThis as unknown as { __mmLimiters?: Record<string, RateLimiter> };
g.__mmLimiters ??= {};
export const limiters = {
  forms: (g.__mmLimiters.forms ??= new RateLimiter({ limit: 5, windowMs: 10 * 60_000 })),
  login: (g.__mmLimiters.login ??= new RateLimiter({ limit: 10, windowMs: 15 * 60_000 })),
  search: (g.__mmLimiters.search ??= new RateLimiter({ limit: 60, windowMs: 60_000 })),
  chat: (g.__mmLimiters.chat ??= new RateLimiter({ limit: 30, windowMs: 60_000 })),
  reset: (g.__mmLimiters.reset ??= new RateLimiter({ limit: 5, windowMs: 60 * 60_000 })),
};
