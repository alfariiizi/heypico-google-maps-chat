# HeyPico Technical Test - LLM with Google Maps Integration

A **production-ready** system that integrates a **Local LLM** with **Google Maps API**, allowing users to search for places and get directions through natural language queries.

## 🎯 Project Overview

This solution demonstrates:
- ✅ **Backend API** built with Hono + TypeScript
- ✅ **Google Maps API** integration with security best practices
- ✅ **Local LLM** integration via Open WebUI
- ✅ **Function calling** for seamless LLM → API communication
- ✅ **Production-grade** code with error handling, rate limiting, and validation

## 🏗️ Architecture

```
User: "Find coffee shops near me"
    ↓
Open WebUI (localhost:3000)
    ↓
Local LLM - Ollama (llama3.2/mistral)
    ↓ [Function Call]
Backend API - Hono (localhost:8432)
    ↓
Google Maps API
    ↓
Response with maps & links
```

## 📦 What's Included

- ✅ **Docker Setup**: Ollama + Open WebUI (`docker-compose.yml`)
- ✅ **Backend API**: Production-ready Hono + TypeScript API (`/backend/`)
- ✅ **Google Maps Integration**: Secure API wrapper with all major endpoints
- ✅ **Open WebUI Functions**: Python functions for LLM integration
- ✅ **Comprehensive Documentation**: Setup guides, testing, and API docs

## 🚀 Quick Start (2 Options!)

### Option 1: Docker (Recommended - Everything in one command!)

```bash
# 1. Add your Google Maps API key to .env file
nano .env

# 2. Start everything with Docker
docker-compose up -d

# 3. Pull LLM model
docker exec -it ollama ollama pull llama3.2
```

That's it! All services are now running:
- ✅ Ollama (localhost:11434)
- ✅ Open WebUI (localhost:3000)
- ✅ Backend API (localhost:8432)

See **[DOCKER_SETUP.md](DOCKER_SETUP.md)** for detailed Docker instructions.

### Option 2: Manual Setup

```bash
# 1. Start Ollama + Open WebUI
docker-compose up -d
docker exec -it ollama ollama pull llama3.2

# 2. Configure & Start Backend manually
cd backend
npm install
nano .env  # Add your Google Maps API key
npm run dev
```

### 3. Add Functions to Open WebUI

1. Copy content from `backend/open-webui-functions/maps_functions.py`
2. In Open WebUI, go to **Workspace** → **Functions**
3. Create new function, paste the code, and enable it

## 🎉 Test It!

In Open WebUI, try:
- "Find me Italian restaurants in New York"
- "How do I get to Central Park from Times Square?"
- "Show me coffee shops near the Golden Gate Bridge"

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete step-by-step setup
- **[backend/README.md](backend/README.md)** - API documentation
- **[backend/TESTING.md](backend/TESTING.md)** - Testing guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical details

## 🔑 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (you have v20.19.4 ✅)
- Google Maps API Key ([Get one here](https://console.cloud.google.com/))
- 8GB RAM minimum

## 📡 API Endpoints

The backend provides:
- `POST /api/maps/search-places` - Search for places
- `POST /api/maps/nearby-places` - Find nearby locations
- `POST /api/maps/place-details` - Get detailed info
- `POST /api/maps/directions` - Get route directions
- `GET /api/maps/health` - Health check

## ✨ Key Features

### Security
- 🔒 API key never exposed to client
- 🛡️ Rate limiting (100 req/min)
- 🔐 Optional authentication
- 🌐 CORS protection

### Code Quality
- 📝 Full TypeScript with strict mode
- ✅ Zod validation for all inputs
- 🎯 Clean architecture
- 📊 Comprehensive error handling
- 📝 JSDoc comments

### Developer Experience
- 🔥 Hot reload in development
- 🎨 Pretty JSON responses
- 📖 Detailed documentation
- 🧪 Testing guide included

## 🛠️ Tech Stack

- **Backend**: Hono (fast, lightweight)
- **Language**: TypeScript (strict mode)
- **Validation**: Zod
- **LLM**: Ollama (llama3.2/mistral)
- **UI**: Open WebUI
- **APIs**: Google Maps (Places, Directions)

## 📊 Project Structure

```
.
├── docker-compose.yml           # Ollama + Open WebUI
├── backend/                     # Backend API
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Google Maps wrapper
│   │   ├── middleware/          # Auth, rate limit, errors
│   │   ├── types/               # TypeScript types
│   │   └── index.ts             # Main app
│   ├── open-webui-functions/    # LLM integration
│   │   └── maps_functions.py
│   ├── package.json
│   └── README.md
├── docs/                        # Test requirements
├── SETUP_GUIDE.md              # Setup instructions
├── PROJECT_SUMMARY.md          # Technical summary
└── README.md                   # This file
```

## 🧪 Testing

```bash
# Test health check
curl http://localhost:8432/api/maps/health

# Test search
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "pizza in New York"}'
```

See `backend/TESTING.md` for comprehensive testing guide.

## 🎓 What This Demonstrates

- ✅ Modern TypeScript development
- ✅ REST API design
- ✅ Third-party API integration
- ✅ LLM function calling
- ✅ Security best practices
- ✅ Error handling & validation
- ✅ Clean code architecture
- ✅ Production-ready patterns
- ✅ Comprehensive documentation

## 🐛 Troubleshooting

### Backend won't start
- Check `GOOGLE_MAPS_API_KEY` in `backend/.env`
- Make sure APIs are enabled in Google Cloud Console

### LLM not calling functions
- Verify function is enabled in Open WebUI
- Check function is enabled for your model
- Use models that support function calling (llama3.2, mistral)

### Google Maps errors
- Enable required APIs: Places API, Directions API
- Check API key restrictions
- Verify billing is enabled (if needed)

## 📞 Service URLs

- **Open WebUI**: http://localhost:3210
- **Backend API**: http://localhost:8432
- **Ollama**: http://localhost:11434

## 🎯 Next Steps After Setup

1. Test the health endpoint
2. Try searching for places
3. Add functions to Open WebUI
4. Test with natural language queries
5. Check embedded maps work
6. Review the code and documentation

## 💡 Tips

- Start with simple queries: "Find coffee shops in Seattle"
- The LLM will automatically detect when to use Google Maps
- Google Maps links in responses are clickable
- Embedded map URLs work in most browsers
- Rate limit is 100 requests per minute (configurable)

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Hono](https://hono.dev/) - Fast web framework
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Open WebUI](https://github.com/open-webui/open-webui) - LLM interface
- [Google Maps API](https://developers.google.com/maps) - Location services
- AI Assistance from Claude Code

---

**Ready to impress?** Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) to get started! 🚀
