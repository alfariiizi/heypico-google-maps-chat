"""
title: Google Maps Integration
author: Moh Rizal Alfarizi
version: 1.0.0
description: Search places and get directions using Google Maps API
"""

from typing import Any, Callable, Optional

import requests
from pydantic import BaseModel, Field


class Tools:
    def __init__(self):
        # Use Docker service name when running in containers, localhost for local dev
        self.backend_url = "http://backend:8432/api/maps"

    def search_places(
        self,
        query: str,
        location: Optional[str] = None,
        radius: int = 5000,
        __event_emitter__: Callable[[dict], Any] = None
    ) -> str:
        """
        Search for places, restaurants, shops, or any location based on a text query.
        Use this when users ask to find places, restaurants, cafes, or any business.

        :param query: Search query (e.g., "coffee shops", "italian restaurants")
        :param location: Optional location to search near (e.g., "New York", "40.7128,-74.0060")
        :param radius: Search radius in meters (default: 5000, max: 50000)
        :return: Formatted string with place results
        """
        try:
            if __event_emitter__:
                __event_emitter__({"type": "status", "data": {"description": f"Searching for {query}...", "done": False}})

            response = requests.post(
                f"{self.backend_url}/search-places",
                json={
                    "query": query,
                    "location": location,
                    "radius": radius
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                places = data.get("data", [])

                if not places:
                    return f"No places found for '{query}'. Try a different search term or location."

                # Format results for display
                result = f"Found {len(places)} places for '{query}':\n\n"

                for i, place in enumerate(places[:5], 1):
                    result += f"{i}. **{place['name']}**\n"
                    result += f"   📍 {place['address']}\n"

                    if place.get('rating'):
                        result += f"   ⭐ Rating: {place['rating']}"
                        if place.get('userRatingsTotal'):
                            result += f" ({place['userRatingsTotal']} reviews)"
                        result += "\n"

                    result += f"   🔗 [View on Google Maps]({place['googleMapsUrl']})\n"
                    result += f"   🗺️ [Embedded Map]({place['embedMapUrl']})\n"
                    result += f"   📌 Place ID: `{place['placeId']}`\n\n"

                if __event_emitter__:
                    __event_emitter__({"type": "status", "data": {"description": "Search completed", "done": True}})

                return result
            else:
                error_msg = data.get("error", {}).get("message", "Unknown error")
                return f"Error searching places: {error_msg}"

        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend API. Make sure the backend server is running at http://localhost:8432"
        except Exception as e:
            return f"❌ Error: {str(e)}"

    def get_directions(
        self,
        origin: str,
        destination: str,
        mode: str = "driving",
        __event_emitter__: Callable[[dict], Any] = None
    ) -> str:
        """
        Get directions and route information between two locations.
        Use this when users ask for directions, routes, or how to get somewhere.

        :param origin: Starting location (address or coordinates)
        :param destination: Destination location (address or coordinates)
        :param mode: Travel mode - one of: driving, walking, bicycling, transit (default: driving)
        :return: Formatted string with directions
        """
        try:
            if __event_emitter__:
                __event_emitter__({"type": "status", "data": {"description": "Getting directions...", "done": False}})

            response = requests.post(
                f"{self.backend_url}/directions",
                json={
                    "origin": origin,
                    "destination": destination,
                    "mode": mode
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                directions = data["data"]

                result = f"**Directions from {origin} to {destination}**\n\n"
                result += f"🚗 Mode: {mode.capitalize()}\n"
                result += f"📏 Distance: {directions['distance']['text']}\n"
                result += f"⏱️ Duration: {directions['duration']['text']}\n"
                result += f"📍 Start: {directions['startAddress']}\n"
                result += f"🎯 End: {directions['endAddress']}\n\n"

                if directions.get('summary'):
                    result += f"**Route:** {directions['summary']}\n\n"

                result += "**Turn-by-turn directions:**\n"
                for i, step in enumerate(directions['steps'][:10], 1):
                    result += f"{i}. {step['instruction']}\n"
                    result += f"   ({step['distance']}, ~{step['duration']})\n\n"

                result += f"\n🔗 [View on Google Maps]({directions['googleMapsUrl']})\n"
                result += f"🗺️ [Embedded Map]({directions['embedMapUrl']})\n"

                if __event_emitter__:
                    __event_emitter__({"type": "status", "data": {"description": "Directions ready", "done": True}})

                return result
            else:
                error_msg = data.get("error", {}).get("message", "Unknown error")
                return f"Error getting directions: {error_msg}"

        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend API. Make sure the backend server is running at http://localhost:8432"
        except Exception as e:
            return f"❌ Error: {str(e)}"

    def get_place_details(
        self,
        placeId: str,
        __event_emitter__: Callable[[dict], Any] = None
    ) -> str:
        """
        Get detailed information about a specific place including ratings, reviews, opening hours, contact info.
        Use this when users want more details about a place.

        :param placeId: Google Maps Place ID (from search results)
        :return: Formatted string with place details
        """
        try:
            if __event_emitter__:
                __event_emitter__({"type": "status", "data": {"description": "Getting place details...", "done": False}})

            response = requests.post(
                f"{self.backend_url}/place-details",
                json={"placeId": placeId},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                place = data["data"]

                result = f"**{place['name']}**\n\n"
                result += f"📍 **Address:** {place['address']}\n"

                if place.get('rating'):
                    result += f"⭐ **Rating:** {place['rating']}"
                    if place.get('userRatingsTotal'):
                        result += f" ({place['userRatingsTotal']} reviews)"
                    result += "\n"

                if place.get('phoneNumber'):
                    result += f"📞 **Phone:** {place['phoneNumber']}\n"

                if place.get('website'):
                    result += f"🌐 **Website:** {place['website']}\n"

                # Opening hours
                if place.get('openingHours'):
                    hours = place['openingHours']
                    status = "🟢 Open now" if hours.get('openNow') else "🔴 Closed"
                    result += f"\n**Hours:** {status}\n"

                    if hours.get('hours'):
                        result += "```\n"
                        for day_hours in hours['hours']:
                            result += f"{day_hours}\n"
                        result += "```\n"

                # Reviews
                if place.get('reviews'):
                    result += "\n**Recent Reviews:**\n"
                    for i, review in enumerate(place['reviews'][:3], 1):
                        result += f"\n{i}. **{review['author']}** - {'⭐' * review['rating']}\n"
                        result += f"   \"{review['text']}\"\n"

                result += f"\n🔗 [View on Google Maps]({place['googleMapsUrl']})\n"
                result += f"🗺️ [Embedded Map]({place['embedMapUrl']})\n"

                if __event_emitter__:
                    __event_emitter__({"type": "status", "data": {"description": "Details loaded", "done": True}})

                return result
            else:
                error_msg = data.get("error", {}).get("message", "Unknown error")
                return f"Error getting place details: {error_msg}"

        except requests.exceptions.ConnectionError:
            return "❌ Cannot connect to backend API. Make sure the backend server is running at http://localhost:8432"
        except Exception as e:
            return f"❌ Error: {str(e)}"
