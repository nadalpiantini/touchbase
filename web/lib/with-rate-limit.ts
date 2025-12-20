/**
 * Rate limiting wrapper for API routes
 * @module lib/with-rate-limit
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, type RateLimitConfig } from "./rate-limit";

/**
 * Wraps an API route handler with rate limiting
 * Can be combined with withRBAC for both auth and rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Handler code
 *   },
 *   RATE_LIMITS.AUTH
 * );
 * ```
 *
 * @example Combined with RBAC
 * ```typescript
 * export const POST = withRateLimit(
 *   withRBAC(
 *     async (request, { orgId, role }) => {
 *       // Handler code with auth and rate limiting
 *     },
 *     { allowedRoles: ['owner', 'admin'] }
 *   ),
 *   RATE_LIMITS.ADMIN
 * );
 * ```
 */
export function withRateLimit<T = unknown>(
  handler: (request: NextRequest, context?: { params?: T }) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMITS.STANDARD
) {
  return async (request: NextRequest, context?: { params?: T }): Promise<NextResponse> => {
    // Get client identifier (user ID if authenticated, otherwise IP)
    const identifier = getClientIdentifier(request);

    // Check rate limit
    const { isLimited, remaining, resetTime } = checkRateLimit(identifier, config);

    // Add rate limit headers to response
    const response = isLimited
      ? NextResponse.json(
          { error: config.message || "Rate limit exceeded" },
          { status: 429 }
        )
      : await handler(request, context);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", Math.floor(resetTime / 1000).toString());

    return response;
  };
}
