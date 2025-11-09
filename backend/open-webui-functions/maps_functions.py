"""
Google Maps Integration Functions for Open WebUI
This file contains all the functions that the LLM can call to interact with Google Maps
"""

import requests
import json
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class SearchPlacesInput(BaseModel):
    query: str = Field(..., description="Search query for places")
    location: Optional[str] = Field(None, description="Location to search near")
    radius: Optional[int] = Field(5000, description="Search radius in meters")


class GetDirectionsInput(BaseModel):
    origin: str = Field(..., description="Starting location")
    destination: str = Field(..., description="Destination location")
    mode: Optional[str] = Field("driving", description="Travel mode")


class GetPlaceDetailsInput(BaseModel):
    placeId: str = Field(..., description="Google Maps Place ID")


# Backend API configuration
BACKEND_URL = "http://localhost:8432/api/maps"


def search_places(query: str, location: Optional[str] = None, radius: int = 5000) -> Dict[str, Any]:
    """
    Search for places based on a text query.

    Args:
        query: Search query (e.g., "coffee shops", "restaurants near me")
        location: Optional location to search near
        radius: Search radius in meters (default: 5000)

    Returns:
        Dictionary containing search results with place information
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/search-places",
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
                return {"message": f"No places found for '{query}'"}

            # Format response for the LLM
            result = {
                "found": len(places),
                "places": []
            }

            for place in places[:5]:  # Return top 5 results
                result["places"].append({
                    "name": place["name"],
                    "address": place["address"],
                    "rating": place.get("rating"),
                    "googleMapsUrl": place["googleMapsUrl"],
                    "embedMapUrl": place["embedMapUrl"],
                    "placeId": place["placeId"]
                })

            return result
        else:
            return {"error": data.get("error", {}).get("message", "Unknown error")}

    except Exception as e:
        return {"error": f"Failed to search places: {str(e)}"}


def get_directions(origin: str, destination: str, mode: str = "driving") -> Dict[str, Any]:
    """
    Get directions between two locations.

    Args:
        origin: Starting location
        destination: Destination location
        mode: Travel mode (driving, walking, bicycling, transit)

    Returns:
        Dictionary containing route information and directions
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/directions",
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
            return {
                "summary": directions["summary"],
                "distance": directions["distance"]["text"],
                "duration": directions["duration"]["text"],
                "startAddress": directions["startAddress"],
                "endAddress": directions["endAddress"],
                "googleMapsUrl": directions["googleMapsUrl"],
                "embedMapUrl": directions["embedMapUrl"],
                "steps": [
                    {
                        "instruction": step["instruction"],
                        "distance": step["distance"],
                        "duration": step["duration"]
                    }
                    for step in directions["steps"][:10]  # First 10 steps
                ]
            }
        else:
            return {"error": data.get("error", {}).get("message", "Unknown error")}

    except Exception as e:
        return {"error": f"Failed to get directions: {str(e)}"}


def get_place_details(placeId: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific place.

    Args:
        placeId: Google Maps Place ID

    Returns:
        Dictionary containing detailed place information
    """
    try:
        response = requests.post(
            f"{BACKEND_URL}/place-details",
            json={"placeId": placeId},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        if data.get("success"):
            place = data["data"]
            result = {
                "name": place["name"],
                "address": place["address"],
                "rating": place.get("rating"),
                "userRatingsTotal": place.get("userRatingsTotal"),
                "phoneNumber": place.get("phoneNumber"),
                "website": place.get("website"),
                "googleMapsUrl": place["googleMapsUrl"],
                "embedMapUrl": place["embedMapUrl"]
            }

            if place.get("openingHours"):
                result["openingHours"] = {
                    "openNow": place["openingHours"].get("openNow"),
                    "hours": place["openingHours"].get("weekdayText", [])
                }

            if place.get("reviews"):
                result["reviews"] = [
                    {
                        "author": review["authorName"],
                        "rating": review["rating"],
                        "text": review["text"][:200]  # Truncate long reviews
                    }
                    for review in place["reviews"][:3]  # Top 3 reviews
                ]

            return result
        else:
            return {"error": data.get("error", {}).get("message", "Unknown error")}

    except Exception as e:
        return {"error": f"Failed to get place details: {str(e)}"}


# Function registry for Open WebUI
TOOLS = [
    {
        "name": "search_places",
        "description": "Search for places, restaurants, shops, or any location based on a text query",
        "function": search_places,
        "parameters": SearchPlacesInput
    },
    {
        "name": "get_directions",
        "description": "Get directions and route information between two locations",
        "function": get_directions,
        "parameters": GetDirectionsInput
    },
    {
        "name": "get_place_details",
        "description": "Get detailed information about a specific place",
        "function": get_place_details,
        "parameters": GetPlaceDetailsInput
    }
]
