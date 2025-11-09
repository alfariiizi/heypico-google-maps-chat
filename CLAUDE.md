# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM-powered Google Maps integration system combining a Hono backend API, Ollama for local LLM runtime, and Open WebUI as the chat interface. Users can search for places and get directions through natural language queries.

**Tech Stack:**
- Backend: Hono + TypeScript (ESM modules)
- LLM: Ollama (llama3.2/mistral models)
- UI: Open WebUI
- APIs: Google Maps (Places API, Directions API)
- Validation: Zod schemas
- Deployment: Docker Compose

## Common Commands

### Docker Operations (Makefile)
```bash
make start           # Start all services (Ollama, Open WebUI, Backend)
make stop            # Stop all services
make restart         # Restart all services
make logs            # Show all logs
make logs-backend    # Backend logs only
make logs-ollama     # Ollama logs only
make pull-model      # Pull llama3.2 model
make list-models     # List installed models
make test-backend    # Test backend health endpoint
make rebuild         # Rebuild backend container
make status          # Show service status
make clean           # Remove containers, volumes, images
```

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build
```

### Docker Compose (Alternative)
```bash
docker-compose up -d                    # Start all services
docker-compose up -d --build            # Rebuild and start
docker-compose logs -f backend          # Follow backend logs
docker exec ollama ollama pull llama3.2 # Pull LLM model
docker exec -it heypico-backend sh      # Shell into backend
```

## Architecture

**Request Flow:**
```
User Query → Open WebUI (localhost:3000)
  → Local LLM (Ollama)
  → Function Call Detection
  → Backend API (localhost:8432)
  → Google Maps API
  → Response with maps & links
```

**Backend Structure:**
```
backend/src/
├── config/env.ts              # Environment validation with Zod
├── middleware/
│   ├── auth.ts                # Optional API key auth (Bearer token or query param)
│   ├── errorHandler.ts        # Global error handler with standardized responses
│   └── rateLimit.ts           # IP-based rate limiting (default: 100 req/min)
├── routes/maps.ts             # API endpoints (4 routes + health check)
├── services/googleMaps.ts     # Google Maps API wrapper (singleton pattern)
├── types/maps.ts              # Zod schemas + TypeScript types
└── index.ts                   # Hono app with middleware chain
```

**Key Design Patterns:**
- **Singleton Service**: `googleMapsService` is a single instance exported from services
- **Middleware Chain**: logger → prettyJSON → CORS → rate limiter → auth → routes
- **Error Handling**: All routes throw errors caught by global `errorHandler`
- **Validation**: Zod schemas parse request bodies; validation errors auto-formatted
- **Response Format**: Consistent `{ success: boolean, data?: any, error?: {...} }`

## API Endpoints

All endpoints use `POST` except health check:

- `GET /api/maps/health` - Health check (no auth required)
- `POST /api/maps/search-places` - Text search for places
- `POST /api/maps/nearby-places` - Location-based nearby search
- `POST /api/maps/place-details` - Detailed place information
- `POST /api/maps/directions` - Route directions between two points

**Authentication:**
- Optional API key via `Authorization: Bearer {key}` or `?api_key={key}`
- Health check endpoint bypasses auth
- Configured via `API_KEY` environment variable

## Environment Configuration

**Backend (.env):**
```env
PORT=8432
NODE_ENV=development|production
GOOGLE_MAPS_API_KEY=required
API_KEY=optional-for-authentication
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Required Google Cloud APIs:**
- Places API (search, nearby, details)
- Directions API
- Maps Embed API (for embedded map URLs)

## Open WebUI Function Integration

**Python functions location:** `backend/open-webui-functions/maps_functions.py`

This file contains the function calling logic that allows LLMs to detect when to call Google Maps APIs. The functions are manually added to Open WebUI via:
1. Workspace → Functions → Create Function
2. Paste Python code from `maps_functions.py`
3. Enable the function for your model

**Alternative:** JSON configurations in `open-webui-functions/*.json` for manual tool setup

## Important Implementation Details

**Module System:**
- Uses ESM modules (`"type": "module"` in package.json)
- All imports must use `.js` extension even for `.ts` files
- Example: `import { env } from './config/env.js'`

**Google Maps Service:**
- Wraps `@googlemaps/google-maps-services-js` client
- Generates clickable Google Maps URLs and embeddable map URLs
- Formats responses with consistent structure
- Handles API errors with descriptive messages
- Strips HTML from turn-by-turn directions

**Rate Limiting:**
- In-memory store (resets on server restart)
- Keyed by IP address
- Returns 429 status with `Retry-After` header
- Configurable window and max requests

**CORS Configuration:**
- Allows `localhost:3000` (Open WebUI default)
- Allows `localhost:8080` (Open WebUI alternative)
- Credentials enabled for cookie-based auth

## Testing

**Quick health check:**
```bash
curl http://localhost:8432/api/maps/health
```

**Search places example:**
```bash
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shops in Seattle", "radius": 2000}'
```

**Test with LLM:**
1. Ensure all services running: `make status`
2. Open http://localhost:3210
3. Try: "Find Italian restaurants in New York"
4. LLM should automatically call backend API

## Services & Ports

- **Open WebUI**: http://localhost:3210
- **Backend API**: http://localhost:8432
- **Ollama**: http://localhost:11434

## Troubleshooting

**Backend won't start:**
- Verify `GOOGLE_MAPS_API_KEY` is set in `backend/.env`
- Check Google Cloud Console APIs are enabled
- Check port 8432 is not in use

**LLM not calling functions:**
- Verify function is enabled in Open WebUI for your model
- Use function-calling capable models (llama3.2, mistral)
- Check backend is accessible: `curl http://localhost:8432/api/maps/health`

**Docker build issues:**
- Clean rebuild: `make clean && make start`
- Check logs: `make logs-backend`
- Verify `.env` file exists at project root with `GOOGLE_MAPS_API_KEY`

**Rate limit errors:**
- Default: 100 requests per 60 seconds
- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`
- Rate limiter resets on server restart (in-memory store)
