# Testing Guide

Comprehensive testing instructions for the HeyPico Maps Backend API.

## 🧪 Manual Testing

### Prerequisites

- Backend server running on `http://localhost:8432`
- Google Maps API key configured in `.env`

### Test 1: Health Check

```bash
curl http://localhost:8432/api/maps/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-09T...",
    "service": "Google Maps API Integration"
  }
}
```

### Test 2: Search Places

```bash
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{
    "query": "pizza restaurants in New York"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "placeId": "ChIJ...",
      "name": "Joe's Pizza",
      "address": "7 Carmine St, New York, NY 10014",
      "location": {
        "lat": 40.730610,
        "lng": -73.997242
      },
      "rating": 4.5,
      "userRatingsTotal": 2000,
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:...",
      "embedMapUrl": "https://www.google.com/maps/embed/v1/place?..."
    }
  ]
}
```

### Test 3: Nearby Places

```bash
curl -X POST http://localhost:8432/api/maps/nearby-places \
  -H "Content-Type: application/json" \
  -d '{
    "location": "40.7128,-74.0060",
    "radius": 1000,
    "type": "cafe"
  }'
```

### Test 4: Place Details

```bash
# Use a placeId from the search results
curl -X POST http://localhost:8432/api/maps/place-details \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "placeId": "ChIJ...",
    "name": "Place Name",
    "address": "Full Address",
    "location": { "lat": 0, "lng": 0 },
    "rating": 4.5,
    "userRatingsTotal": 1000,
    "phoneNumber": "+1 234 567 8900",
    "website": "https://example.com",
    "openingHours": {
      "openNow": true,
      "weekdayText": [
        "Monday: 9:00 AM – 5:00 PM",
        "Tuesday: 9:00 AM – 5:00 PM"
      ]
    },
    "reviews": [
      {
        "authorName": "John Doe",
        "rating": 5,
        "text": "Great place!"
      }
    ],
    "googleMapsUrl": "...",
    "embedMapUrl": "..."
  }
}
```

### Test 5: Directions

```bash
curl -X POST http://localhost:8432/api/maps/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Times Square, New York",
    "destination": "Central Park, New York",
    "mode": "walking"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": "5th Ave",
    "distance": {
      "text": "1.2 km",
      "value": 1200
    },
    "duration": {
      "text": "15 mins",
      "value": 900
    },
    "startAddress": "Times Square, Manhattan, NY...",
    "endAddress": "Central Park, New York, NY...",
    "steps": [
      {
        "instruction": "Head north on Broadway toward W 43rd St",
        "distance": "0.1 km",
        "duration": "1 min"
      }
    ],
    "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&origin=...",
    "embedMapUrl": "https://www.google.com/maps/embed/v1/directions?..."
  }
}
```

## 🔒 Security Testing

### Test Rate Limiting

```bash
# Send 101 requests rapidly (exceeds limit of 100)
for i in {1..101}; do
  curl http://localhost:8432/api/maps/health
  echo "Request $i"
done
```

**Expected:** Request 101 should return `429 Too Many Requests`

### Test API Key Authentication

If `API_KEY` is set in `.env`:

```bash
# Without API key - should fail
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# With API key - should succeed
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"query": "test"}'
```

## ❌ Error Testing

### Test Invalid Request

```bash
# Missing required field
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "error": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "statusCode": 400,
    "details": [
      {
        "path": "query",
        "message": "Query is required"
      }
    ]
  }
}
```

### Test Invalid Place ID

```bash
curl -X POST http://localhost:8432/api/maps/place-details \
  -H "Content-Type: application/json" \
  -d '{"placeId": "invalid-place-id"}'
```

**Expected:** Error response with status 502

### Test 404

```bash
curl http://localhost:8432/api/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "error": "NOT_FOUND",
    "message": "Endpoint not found",
    "statusCode": 404
  }
}
```

## 🎯 Integration Testing with Open WebUI

### Test 1: Search Flow

1. Open chat in Open WebUI
2. Send: "Find me coffee shops in Seattle"
3. **Verify:**
   - LLM calls `search_places` function
   - Backend returns results
   - LLM formats and displays results
   - Google Maps links are clickable

### Test 2: Directions Flow

1. Send: "How do I get from Seattle Space Needle to Pike Place Market?"
2. **Verify:**
   - LLM calls `get_directions` function
   - Backend returns route
   - LLM displays distance, duration, and steps
   - Google Maps link opens in new tab

### Test 3: Details Flow

1. First search: "Find restaurants in Portland"
2. Then ask: "Tell me more about the first one"
3. **Verify:**
   - LLM extracts placeId from previous response
   - Calls `get_place_details` function
   - Displays detailed info including reviews

## 📊 Performance Testing

### Response Time

```bash
# Measure response time
time curl http://localhost:8432/api/maps/health
```

**Expected:** < 100ms for health check

### Concurrent Requests

```bash
# Install apache bench if needed: sudo apt install apache2-utils

# Send 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:8432/api/maps/health
```

**Expected:** All requests should succeed

## ✅ Checklist

Before submitting, verify:

- [ ] Health check returns 200 OK
- [ ] Search places returns valid results
- [ ] Nearby places works with coordinates
- [ ] Place details returns full information
- [ ] Directions returns route with steps
- [ ] Rate limiting blocks excessive requests
- [ ] Invalid requests return proper error messages
- [ ] 404 for nonexistent endpoints
- [ ] CORS allows Open WebUI origins
- [ ] Google Maps links are valid and clickable
- [ ] Embedded map URLs work
- [ ] LLM successfully calls all functions
- [ ] Response times are reasonable (< 2s)
- [ ] No API keys exposed in responses
- [ ] Error messages are user-friendly

## 🐛 Common Issues

### "Google Maps API error: REQUEST_DENIED"
- Enable required APIs in Google Cloud Console
- Check API key restrictions

### "CORS error" in browser
- Add your Open WebUI URL to CORS origins in `src/index.ts`

### Rate limit hit during testing
- Wait 60 seconds or restart the server
- Increase `RATE_LIMIT_MAX_REQUESTS` in `.env`

### Slow responses
- Check internet connection
- Verify Google Maps API is responding
- Check server logs for errors

## 📝 Test Report Template

```markdown
# Test Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development

## Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Health Check | ✅ Pass | Response time: 50ms |
| Search Places | ✅ Pass | Returns 10+ results |
| Nearby Places | ✅ Pass | Accurate location filtering |
| Place Details | ✅ Pass | Complete information |
| Directions | ✅ Pass | Valid routes |
| Rate Limiting | ✅ Pass | Blocks at 100 requests |
| Error Handling | ✅ Pass | Clear error messages |
| Open WebUI Integration | ✅ Pass | LLM calls functions correctly |

## Issues Found

None

## Recommendations

- Consider adding caching for frequently searched places
- Add metrics/analytics
```
