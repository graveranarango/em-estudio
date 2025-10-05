import * as kv from '../kv_store.tsx';

export interface RateLimit {
  perUserPerMinute: number;
  burst: number;
}

export class RateLimiter {
  private limits: RateLimit;

  constructor(limits: RateLimit = { perUserPerMinute: 30, burst: 10 }) {
    this.limits = limits;
  }

  async checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // Start of current minute
    const windowKey = `rate_limit:${userId}:${windowStart}`;
    const burstKey = `rate_limit_burst:${userId}`;

    try {
      // Get current counts
      const windowCount = await kv.get(windowKey) || 0;
      const burstCount = await kv.get(burstKey) || 0;

      // Check burst limit (immediate)
      if (burstCount >= this.limits.burst) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + 60000
        };
      }

      // Check per-minute limit
      if (windowCount >= this.limits.perUserPerMinute) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + 60000
        };
      }

      // Allow request - increment counters
      await Promise.all([
        kv.set(windowKey, windowCount + 1, { ttl: 60 }),
        kv.set(burstKey, burstCount + 1, { ttl: 10 })
      ]);

      return {
        allowed: true,
        remaining: this.limits.perUserPerMinute - (windowCount + 1),
        resetTime: windowStart + 60000
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limit check fails
      return {
        allowed: true,
        remaining: this.limits.perUserPerMinute,
        resetTime: windowStart + 60000
      };
    }
  }

  async logRequest(userId: string, threadId: string, stage: string, latency_ms: number, tokens: number, tool?: string): Promise<void> {
    try {
      const logEvent = {
        userId,
        threadId,
        stage,
        latency_ms,
        tokens,
        tool,
        ts: new Date().toISOString()
      };

      // Store in KV for observability
      const logKey = `log:${userId}:${threadId}:${Date.now()}`;
      await kv.set(logKey, logEvent, { ttl: 86400 }); // Keep logs for 24h
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  }
}