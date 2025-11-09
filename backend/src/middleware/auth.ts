import type { Context, Next } from 'hono';
import { env } from '../config/env.js';

/**
 * API Key authentication middleware
 * Validates API key from Authorization header or query parameter
 * Optional: Skip if no API_KEY is configured in environment
 */
export async function apiKeyAuth(c: Context, next: Next): Promise<Response | void> {
  // Skip authentication if no API key is configured
  if (!env.API_KEY) {
    await next();
    return;
  }

  // Get API key from Authorization header or query parameter
  const authHeader = c.req.header('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '') || c.req.query('api_key');

  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'API key is required. Provide it in Authorization header or api_key query parameter.',
          statusCode: 401,
        },
      },
      401
    );
  }

  if (apiKey !== env.API_KEY) {
    return c.json(
      {
        success: false,
        error: {
          error: 'FORBIDDEN',
          message: 'Invalid API key.',
          statusCode: 403,
        },
      },
      403
    );
  }

  await next();
}
