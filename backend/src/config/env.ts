import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  PORT: z.string().default('8432').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GOOGLE_MAPS_API_KEY: z.string().min(1, 'Google Maps API key is required'),
  API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Export typed environment
export type Env = z.infer<typeof envSchema>;
