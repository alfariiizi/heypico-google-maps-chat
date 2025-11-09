# Quick Reference Card

## 🚀 One-Command Setup

```bash
# 1. Start services
docker-compose up -d && docker exec -it ollama ollama pull llama3.2

# 2. Configure and start backend
cd backend && npm install && nano .env && npm run dev
```

## 📞 Important URLs

| Service | URL |
|---------|-----|
| Open WebUI | http://localhost:3000 |
| Backend API | http://localhost:8432 |
| Ollama | http://localhost:11434 |
| API Health | http://localhost:8432/api/maps/health |

## 🔑 Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Add Google Maps API key here |
| `docker-compose.yml` | Ollama + Open WebUI config |
| `backend/src/index.ts` | Main backend app |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/maps/search-places` | Search for places |
| POST | `/api/maps/nearby-places` | Find nearby locations |
| POST | `/api/maps/place-details` | Get place details |
| POST | `/api/maps/directions` | Get directions |
| GET | `/api/maps/health` | Health check |

## 🧪 Quick Tests

```bash
# Health check
curl http://localhost:8432/api/maps/health

# Search places
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shops in San Francisco"}'

# Get directions
curl -X POST http://localhost:8432/api/maps/directions \
  -H "Content-Type: application/json" \
  -d '{"origin": "Times Square", "destination": "Central Park", "mode": "walking"}'
```

## 💬 Sample Queries for LLM

- "Find me Italian restaurants in New York"
- "How do I get from Golden Gate Bridge to Fisherman's Wharf?"
- "Show me coffee shops near the Space Needle"
- "What are the best rated pizza places in Chicago?"
- "Give me directions to the nearest gas station"

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `GOOGLE_MAPS_API_KEY` in `.env` |
| Port 8432 in use | Change `PORT` in `.env` |
| LLM not calling functions | Enable function in Open WebUI settings |
| Google Maps error | Enable APIs in Google Cloud Console |
| Rate limit hit | Wait 60 seconds or increase limit |

## 🔧 Useful Commands

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker exec -it ollama bash       # Enter Ollama container

# Backend
cd backend
npm run dev                       # Development mode
npm run build                     # Build TypeScript
npm start                         # Production mode

# Ollama
docker exec -it ollama ollama list                # List models
docker exec -it ollama ollama pull llama3.2       # Pull model
docker exec -it ollama ollama rm mistral          # Remove model
```

## 📂 Project Structure

```
test/
├── docker-compose.yml              # Ollama + Open WebUI
├── backend/
│   ├── src/
│   │   ├── index.ts                # Main app
│   │   ├── routes/maps.ts          # API endpoints
│   │   ├── services/googleMaps.ts  # Google Maps wrapper
│   │   ├── middleware/             # Auth, rate limit, errors
│   │   └── types/maps.ts           # TypeScript types
│   ├── open-webui-functions/
│   │   └── maps_functions.py       # LLM integration
│   ├── .env                        # Configuration (ADD YOUR API KEY!)
│   └── package.json
├── README.md                       # Main docs
├── SETUP_GUIDE.md                  # Step-by-step setup
└── PROJECT_SUMMARY.md              # Technical details
```

## 🔐 Environment Variables

```env
# backend/.env
PORT=8432
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your-key-here  # ← ADD YOUR KEY
API_KEY=                            # Optional auth
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 Setup Checklist

- [ ] Docker running
- [ ] `docker-compose up -d` executed
- [ ] Ollama model pulled (llama3.2)
- [ ] Open WebUI accessible at localhost:3000
- [ ] Backend `npm install` completed
- [ ] Google Maps API key in `backend/.env`
- [ ] Backend running (`npm run dev`)
- [ ] Health check returns 200 OK
- [ ] Python function added to Open WebUI
- [ ] Function enabled for model
- [ ] Test query successful

## 🎯 Success Criteria

✅ Health endpoint returns "healthy"
✅ Search returns place results
✅ LLM automatically calls functions
✅ Google Maps links work
✅ Embedded maps display
✅ No errors in console

## 📚 Documentation

- **Quick Start**: See README.md
- **Detailed Setup**: See SETUP_GUIDE.md
- **API Docs**: See backend/README.md
- **Testing**: See backend/TESTING.md
- **Summary**: See PROJECT_SUMMARY.md

## 🆘 Get Help

1. Check logs: `docker-compose logs -f`
2. Verify environment: `cat backend/.env`
3. Test backend: `curl http://localhost:8432/api/maps/health`
4. Check function: Open WebUI → Workspace → Functions
5. Review SETUP_GUIDE.md for troubleshooting

## 🎓 Key Features

- ✅ TypeScript with strict mode
- ✅ Zod validation
- ✅ Rate limiting (100/min)
- ✅ API key security
- ✅ CORS protection
- ✅ Error handling
- ✅ Clean architecture
- ✅ Comprehensive docs

---

**Need more details?** Check the full documentation in README.md and SETUP_GUIDE.md
