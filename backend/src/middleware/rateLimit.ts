import type { Context, Next } from 'hono';
import { env } from '../config/env.js';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Rate limiting middleware
 * Limits requests per IP address within a time window
 */
export async function rateLimiter(c: Context, next: Next): Promise<Response | void> {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  // Get or create rate limit entry
  let entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(ip, entry);
  } else if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return c.json(
      {
        success: false,
        error: {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
        },
      },
      429,
      {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
      }
    );
  } else {
    // Increment counter
    entry.count++;
  }

  // Add rate limit headers
  c.header('X-RateLimit-Limit', maxRequests.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
  c.header('X-RateLimit-Reset', entry.resetTime.toString());

  await next();
}

/**
 * Cleanup old entries periodically
 * Run this in production to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetTime + 60000) {
      // Remove entries older than 1 minute past reset time
      store.delete(ip);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
