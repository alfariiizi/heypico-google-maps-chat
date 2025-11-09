# HeyPico Maps Backend API

Production-ready backend API built with **Hono** and **TypeScript** that integrates **Google Maps API** with **Local LLM** via **Open WebUI**.

## 🏗️ Architecture

```
User Query → Open WebUI → Local LLM (Ollama) → Backend API → Google Maps API → Response
```

## ✨ Features

- **🚀 Fast & Lightweight**: Built with Hono for minimal overhead
- **🔒 Secure**: API key authentication, rate limiting, CORS protection
- **📝 Type-Safe**: Full TypeScript with strict mode and Zod validation
- **🗺️ Comprehensive**: Search places, get directions, place details, nearby search
- **🎯 Production-Ready**: Error handling, logging, health checks
- **🔧 Easy Integration**: Ready-to-use functions for Open WebUI

## 📋 Prerequisites

- Node.js 18+ (you have v20.19.4 ✅)
- Google Maps API Key (with Places API and Directions API enabled)
- Open WebUI with Ollama running

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```env
PORT=8432
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key-here
API_KEY=optional-your-api-key-for-auth
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8432`

### 4. Test the API

```bash
# Health check
curl http://localhost:8432/api/maps/health

# Search for coffee shops
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shops in New York"}'
```

## 📡 API Endpoints

### Search Places
**POST** `/api/maps/search-places`

Search for places using text query.

```json
{
  "query": "italian restaurants",
  "location": "New York",
  "radius": 5000
}
```

### Nearby Places
**POST** `/api/maps/nearby-places`

Get places near a specific location.

```json
{
  "location": "40.7128,-74.0060",
  "radius": 1500,
  "type": "restaurant",
  "keyword": "pizza"
}
```

### Place Details
**POST** `/api/maps/place-details`

Get detailed information about a place.

```json
{
  "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

### Directions
**POST** `/api/maps/directions`

Get directions between two locations.

```json
{
  "origin": "Times Square, New York",
  "destination": "Central Park, New York",
  "mode": "walking"
}
```

### Health Check
**GET** `/api/maps/health`

Check API health status.

## 🔗 Open WebUI Integration

### Method 1: Python Functions (Recommended)

1. Copy `open-webui-functions/maps_functions.py` to Open WebUI
2. In Open WebUI, go to **Workspace** → **Functions**
3. Click **Create Function** and paste the content
4. Save and enable the function

The LLM will now automatically detect when to use Google Maps!

### Method 2: Manual Tool Configuration

Use the JSON configurations in `open-webui-functions/` directory:
- `search_places.json`
- `get_directions.json`
- `get_place_details.json`

## 🧪 Testing

### Test Search Places

```bash
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{
    "query": "coffee shops",
    "location": "San Francisco",
    "radius": 2000
  }'
```

### Test Directions

```bash
curl -X POST http://localhost:8432/api/maps/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Golden Gate Bridge",
    "destination": "Fisherman'\''s Wharf",
    "mode": "driving"
  }'
```

## 🔐 Security Features

### API Key Authentication (Optional)

Set `API_KEY` in `.env` to enable authentication:

```bash
# Using Authorization header
curl -H "Authorization: Bearer your-api-key" \
  http://localhost:8432/api/maps/search-places

# Using query parameter
curl http://localhost:8432/api/maps/search-places?api_key=your-api-key
```

### Rate Limiting

- Default: 100 requests per 60 seconds per IP
- Configurable via environment variables
- Returns `429 Too Many Requests` when exceeded
- Includes retry-after header

### CORS Protection

Configured for Open WebUI origins:
- `http://localhost:3210`
- `http://localhost:8080`

## 📊 Response Format

All responses follow this structure:

```typescript
{
  "success": boolean,
  "data": any,      // Present on success
  "error": {        // Present on error
    "error": string,
    "message": string,
    "statusCode": number
  }
}
```

## 🛠️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── middleware/
│   │   ├── auth.ts             # API key authentication
│   │   ├── errorHandler.ts    # Global error handler
│   │   └── rateLimit.ts        # Rate limiting
│   ├── routes/
│   │   └── maps.ts             # Google Maps endpoints
│   ├── services/
│   │   └── googleMaps.ts       # Google Maps API wrapper
│   ├── types/
│   │   └── maps.ts             # TypeScript types & schemas
│   └── index.ts                # Main application
├── open-webui-functions/
│   ├── maps_functions.py       # Python functions for Open WebUI
│   ├── search_places.json      # Function config
│   ├── get_directions.json     # Function config
│   └── get_place_details.json  # Function config
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🎯 Usage with LLM

Once integrated with Open WebUI, users can ask natural questions like:

- "Find coffee shops near me"
- "Show me Italian restaurants in Manhattan"
- "How do I get to Central Park from Times Square?"
- "What are the reviews for [place name]?"

The LLM will automatically call the appropriate functions and display results with embedded maps!

## 📝 Best Practices Implemented

✅ **Type Safety**: Full TypeScript with strict mode
✅ **Input Validation**: Zod schemas for all requests
✅ **Error Handling**: Centralized error handler with proper status codes
✅ **Security**: API key auth, rate limiting, CORS
✅ **Logging**: Request logging with Hono logger
✅ **Code Organization**: Clean architecture with separation of concerns
✅ **Environment Config**: Validated environment variables
✅ **API Key Protection**: Google Maps API key never exposed to client
✅ **Rate Limiting**: Prevents API quota exhaustion

## 🐛 Troubleshooting

### Google Maps API Errors

1. **INVALID_REQUEST**: Check your API key is correct
2. **OVER_QUERY_LIMIT**: Enable billing or reduce requests
3. **REQUEST_DENIED**: Enable required APIs in Google Cloud Console

Required APIs:
- Places API
- Directions API
- Maps Embed API (for embed URLs)
- Geocoding API (recommended)

### Backend Not Starting

```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env
```

### Open WebUI Can't Connect

1. Ensure backend is running: `curl http://localhost:8432/api/maps/health`
2. Check CORS origins in `src/index.ts`
3. Verify Open WebUI is on `http://localhost:3210` or `http://localhost:8080`

## 📦 Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🚀 Deployment Options

- **Railway**: Connect GitHub repo, set environment variables
- **Vercel**: Add as serverless function
- **Docker**: Create Dockerfile (coming soon)
- **VPS**: Use PM2 for process management

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for HeyPico Technical Test

---

**Need Help?** Check the troubleshooting section or review the code comments for detailed explanations.
