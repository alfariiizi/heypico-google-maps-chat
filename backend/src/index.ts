import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { env } from './config/env.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { apiKeyAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import maps from './routes/maps.js';

/**
 * Initialize Hono application
 */
const app = new Hono();

/**
 * Global middleware
 */
app.use('*', logger()); // Request logging
app.use('*', prettyJSON()); // Pretty JSON responses
app.use(
  '*',
  cors({
    origin: ['http://localhost:3210', 'http://localhost:8080'], // Open WebUI origins
    credentials: true,
  })
);

/**
 * Apply rate limiting to API routes
 */
app.use('/api/*', rateLimiter);

/**
 * Apply authentication to protected routes
 * Skip for health check endpoints
 */
app.use('/api/maps/*', async (c, next) => {
  if (c.req.path.endsWith('/health')) {
    await next();
    return;
  }
  await apiKeyAuth(c, next);
});

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    name: 'HeyPico Maps Backend API',
    version: '1.0.0',
    description: 'Backend API for LLM + Google Maps integration',
    endpoints: {
      health: '/api/maps/health',
      searchPlaces: 'POST /api/maps/search-places',
      nearbyPlaces: 'POST /api/maps/nearby-places',
      placeDetails: 'POST /api/maps/place-details',
      directions: 'POST /api/maps/directions',
    },
    documentation: 'See README.md for usage instructions',
  });
});

/**
 * Mount routes
 */
app.route('/api/maps', maps);

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        error: 'NOT_FOUND',
        message: 'Endpoint not found',
        statusCode: 404,
      },
    },
    404
  );
});

/**
 * Global error handler
 */
app.onError(errorHandler);

/**
 * Start server
 */
const port = env.PORT;

console.log(`🚀 Server starting on port ${port}`);
console.log(`📍 Environment: ${env.NODE_ENV}`);
console.log(`🔑 API Key authentication: ${env.API_KEY ? 'enabled' : 'disabled'}`);
console.log(`⏱️  Rate limiting: ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS}ms`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server is running on http://localhost:${port}`);
console.log(`📖 API documentation: http://localhost:${port}`);
console.log(`❤️  Health check: http://localhost:${port}/api/maps/health`);
