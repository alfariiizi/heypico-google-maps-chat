import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import { env } from '../config/env.js';
import type {
  SearchPlacesRequest,
  GetPlaceDetailsRequest,
  GetDirectionsRequest,
  GetNearbyPlacesRequest,
  PlaceResult,
  PlaceDetails,
  DirectionsResult,
} from '../types/maps.js';

/**
 * Google Maps Service
 * Handles all interactions with Google Maps APIs
 * Implements best practices: error handling, rate limiting awareness, and proper typing
 */
export class GoogleMapsService {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.client = new Client({});
    this.apiKey = env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Search for places using text query
   * Uses Places API Text Search
   */
  async searchPlaces(params: SearchPlacesRequest): Promise<PlaceResult[]> {
    try {
      const response = await this.client.textSearch({
        params: {
          query: params.query,
          key: this.apiKey,
          ...(params.location && { location: params.location }),
          ...(params.radius && { radius: params.radius }),
          ...(params.type && { type: params.type as any }),
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.results.map((place) => this.formatPlaceResult(place));
    } catch (error) {
      this.handleError(error, 'searchPlaces');
      throw error;
    }
  }

  /**
   * Get nearby places based on location
   * Uses Places API Nearby Search
   */
  async getNearbyPlaces(params: GetNearbyPlacesRequest): Promise<PlaceResult[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: params.location,
          radius: params.radius,
          key: this.apiKey,
          ...(params.type && { type: params.type as any }),
          ...(params.keyword && { keyword: params.keyword }),
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.results.map((place) => this.formatPlaceResult(place));
    } catch (error) {
      this.handleError(error, 'getNearbyPlaces');
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   * Uses Places API Place Details
   */
  async getPlaceDetails(params: GetPlaceDetailsRequest): Promise<PlaceDetails> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: params.placeId,
          key: this.apiKey,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'user_ratings_total',
            'price_level',
            'types',
            'business_status',
            'formatted_phone_number',
            'website',
            'opening_hours',
            'reviews',
            'photos',
          ],
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const place = response.data.result;
      const basicInfo = this.formatPlaceResult(place);

      return {
        ...basicInfo,
        phoneNumber: place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours
          ? {
              openNow: place.opening_hours.open_now,
              weekdayText: place.opening_hours.weekday_text,
            }
          : undefined,
        reviews: place.reviews?.slice(0, 5).map((review) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: Number(review.time),
        })),
      };
    } catch (error) {
      this.handleError(error, 'getPlaceDetails');
      throw error;
    }
  }

  /**
   * Get directions between two locations
   * Uses Directions API
   */
  async getDirections(params: GetDirectionsRequest): Promise<DirectionsResult> {
    try {
      const response = await this.client.directions({
        params: {
          origin: params.origin,
          destination: params.destination,
          mode: (params.mode as TravelMode) || TravelMode.driving,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        summary: route.summary,
        distance: {
          text: leg.distance.text,
          value: leg.distance.value,
        },
        duration: {
          text: leg.duration.text,
          value: leg.duration.value,
        },
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
          distance: step.distance.text,
          duration: step.duration.text,
        })),
        googleMapsUrl: this.generateDirectionsUrl(params.origin, params.destination, params.mode),
        embedMapUrl: this.generateEmbedDirectionsUrl(params.origin, params.destination, params.mode),
      };
    } catch (error) {
      this.handleError(error, 'getDirections');
      throw error;
    }
  }

  /**
   * Format place result with consistent structure
   */
  private formatPlaceResult(place: any): PlaceResult {
    const placeId = place.place_id;
    const lat = place.geometry?.location?.lat;
    const lng = place.geometry?.location?.lng;

    return {
      placeId,
      name: place.name || 'Unknown',
      address: place.formatted_address || place.vicinity || 'Address not available',
      location: {
        lat: typeof lat === 'function' ? lat() : lat,
        lng: typeof lng === 'function' ? lng() : lng,
      },
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      businessStatus: place.business_status,
      priceLevel: place.price_level,
      photoUrl: place.photos?.[0]
        ? this.generatePhotoUrl(place.photos[0].photo_reference)
        : undefined,
      googleMapsUrl: this.generatePlaceUrl(placeId),
      embedMapUrl: this.generateEmbedMapUrl(lat, lng, placeId),
    };
  }

  /**
   * Generate Google Maps URL for a place
   */
  private generatePlaceUrl(placeId: string): string {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  }

  /**
   * Generate embed map URL for a place
   */
  private generateEmbedMapUrl(lat: number, lng: number, placeId?: string): string {
    const query = placeId ? `place_id:${placeId}` : `${lat},${lng}`;
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${encodeURIComponent(query)}`;
  }

  /**
   * Generate Google Maps URL for directions
   */
  private generateDirectionsUrl(
    origin: string,
    destination: string,
    mode?: string
  ): string {
    const modeParam = mode ? `&travelmode=${mode}` : '';
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${modeParam}`;
  }

  /**
   * Generate embed map URL for directions
   */
  private generateEmbedDirectionsUrl(
    origin: string,
    destination: string,
    mode?: string
  ): string {
    const modeParam = mode ? `&mode=${mode}` : '';
    return `https://www.google.com/maps/embed/v1/directions?key=${this.apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${modeParam}`;
  }

  /**
   * Generate photo URL from photo reference
   */
  private generatePhotoUrl(photoReference: string): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Centralized error handling
   */
  private handleError(error: any, method: string): void {
    console.error(`[GoogleMapsService.${method}] Error:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
