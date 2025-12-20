/**
 * Simple in-memory rate limiting for API routes
 * @module lib/rate-limit
 *
 * NOTE: For production, consider using @upstash/ratelimit with Redis
 * This implementation uses in-memory Map which resets on server restart
 */

export interface RateLimitConfig {
  /** Max requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom message for rate limit exceeded */
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const limitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limitStore.entries()) {
    if (entry.resetTime < now) {
      limitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Object with isLimited flag and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { isLimited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${identifier}`;

  let entry = limitStore.get(key);

  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    limitStore.set(key, entry);
  }

  // Increment counter
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const isLimited = entry.count > config.maxRequests;

  return {
    isLimited,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit configurations by tier
 */
export const RATE_LIMITS = {
  /** Public endpoints (health, status) */
  PUBLIC: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests from this IP. Please try again in 1 minute.",
  },

  /** Authentication endpoints (login, signup) */
  AUTH: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many login attempts. Please try again in 1 minute.",
  },

  /** Standard authenticated endpoints */
  STANDARD: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
    message: "Rate limit exceeded. Please slow down your requests.",
  },

  /** Admin/write endpoints */
  ADMIN: {
    maxRequests: 500,
    windowMs: 60 * 1000, // 1 minute
    message: "Rate limit exceeded for admin operations.",
  },
} as const;

/**
 * Helper to get client identifier (IP or user ID)
 * Prefers user ID if authenticated, falls back to IP
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  // Try to get IP from headers (works with Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return `ip:${ip}`;
}
