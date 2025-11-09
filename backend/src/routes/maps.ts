import { Hono } from 'hono';
import { googleMapsService } from '../services/googleMaps.js';
import {
  SearchPlacesSchema,
  GetPlaceDetailsSchema,
  GetDirectionsSchema,
  GetNearbyPlacesSchema,
} from '../types/maps.js';
import type { ApiResponse, PlaceResult, PlaceDetails, DirectionsResult } from '../types/maps.js';

const maps = new Hono();

/**
 * POST /api/maps/search-places
 * Search for places using text query
 */
maps.post('/search-places', async (c) => {
  try {
    const body = await c.req.json();
    const validated = SearchPlacesSchema.parse(body);

    const results = await googleMapsService.searchPlaces(validated);

    const response: ApiResponse<PlaceResult[]> = {
      success: true,
      data: results,
    };

    return c.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/maps/nearby-places
 * Get nearby places based on location coordinates
 */
maps.post('/nearby-places', async (c) => {
  try {
    const body = await c.req.json();
    const validated = GetNearbyPlacesSchema.parse(body);

    const results = await googleMapsService.getNearbyPlaces(validated);

    const response: ApiResponse<PlaceResult[]> = {
      success: true,
      data: results,
    };

    return c.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/maps/place-details
 * Get detailed information about a specific place
 */
maps.post('/place-details', async (c) => {
  try {
    const body = await c.req.json();
    const validated = GetPlaceDetailsSchema.parse(body);

    const result = await googleMapsService.getPlaceDetails(validated);

    const response: ApiResponse<PlaceDetails> = {
      success: true,
      data: result,
    };

    return c.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/maps/directions
 * Get directions between two locations
 */
maps.post('/directions', async (c) => {
  try {
    const body = await c.req.json();
    const validated = GetDirectionsSchema.parse(body);

    const result = await googleMapsService.getDirections(validated);

    const response: ApiResponse<DirectionsResult> = {
      success: true,
      data: result,
    };

    return c.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/maps/health
 * Health check endpoint
 */
maps.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Google Maps API Integration',
    },
  });
});

export default maps;
