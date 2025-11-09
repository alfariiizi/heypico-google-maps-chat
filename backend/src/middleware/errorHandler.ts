import type { Context } from 'hono';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * Catches and formats all errors consistently
 */
export async function errorHandler(err: Error, c: Context) {
  console.error('[Error Handler]', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          statusCode: 400,
          details: err.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      400
    );
  }

  // Handle Google Maps API errors
  if (err.message.includes('Google Maps API error')) {
    return c.json(
      {
        success: false,
        error: {
          error: 'GOOGLE_MAPS_ERROR',
          message: err.message,
          statusCode: 502,
        },
      },
      502
    );
  }

  // Handle generic errors
  return c.json(
    {
      success: false,
      error: {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    },
    500
  );
}
