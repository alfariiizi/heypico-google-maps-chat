import { z } from 'zod';

// Request validation schemas
export const SearchPlacesSchema = z.object({
  query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  location: z.string().optional(),
  radius: z.number().min(1).max(50000).optional().default(5000),
  type: z.string().optional(),
});

export const GetPlaceDetailsSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
});

export const GetDirectionsSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).optional().default('driving'),
});

export const GetNearbyPlacesSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  radius: z.number().min(1).max(50000).optional().default(1500),
  type: z.string().optional(),
  keyword: z.string().optional(),
});

// Type exports
export type SearchPlacesRequest = z.infer<typeof SearchPlacesSchema>;
export type GetPlaceDetailsRequest = z.infer<typeof GetPlaceDetailsSchema>;
export type GetDirectionsRequest = z.infer<typeof GetDirectionsSchema>;
export type GetNearbyPlacesRequest = z.infer<typeof GetNearbyPlacesSchema>;

// Response types
export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  businessStatus?: string;
  priceLevel?: number;
  photoUrl?: string;
  googleMapsUrl: string;
  embedMapUrl: string;
}

export interface PlaceDetails extends PlaceResult {
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export interface DirectionsResult {
  summary: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  startAddress: string;
  endAddress: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
  googleMapsUrl: string;
  embedMapUrl: string;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}
