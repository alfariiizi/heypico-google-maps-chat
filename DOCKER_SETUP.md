# Docker Setup Guide

Complete Docker setup - everything runs with one command!

## 🚀 One-Command Setup

```bash
docker-compose up -d
```

That's it! This starts:
- ✅ Ollama (LLM runtime)
- ✅ Open WebUI (Chat interface)
- ✅ Backend API (Google Maps integration)

## 📋 Prerequisites

- Docker & Docker Compose installed
- Google Maps API key
- 8GB RAM minimum

## ⚙️ Configuration

### 1. Set Your Google Maps API Key

Edit `.env` in the root directory:

```bash
nano .env
```

Add your API key:
```env
GOOGLE_MAPS_API_KEY=AIzaSyC-your-actual-key-here
```

### 2. Start Everything

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Pull LLM Model

```bash
# Pull llama3.2 (recommended)
docker exec -it ollama ollama pull llama3.2

# Or pull mistral
docker exec -it ollama ollama pull mistral
```

### 4. Access Services

- **Open WebUI**: http://localhost:3000
- **Backend API**: http://localhost:8432
- **Ollama**: http://localhost:11434

### 5. Add Function to Open WebUI

1. Go to http://localhost:3000
2. Navigate to **Workspace** → **Functions**
3. Copy content from `backend/open-webui-functions/google_maps_tool.py`
4. Create new function, paste, and save
5. Enable the function

## 🧪 Test It

### Test Backend Health

```bash
curl http://localhost:8432/api/maps/health
```

Expected:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "...",
    "service": "Google Maps API Integration"
  }
}
```

### Test Search

```bash
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shops in Jakarta"}'
```

### Test with LLM

In Open WebUI chat:
```
Find me coffee shops in Yogyakarta
```

## 🔧 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f open-webui
docker-compose logs -f ollama

# Restart a service
docker-compose restart backend

# Rebuild backend after code changes
docker-compose up -d --build backend

# Remove everything (including volumes)
docker-compose down -v
```

## 📊 Service Architecture

```
┌─────────────────────────────────────┐
│   Docker Compose Network            │
│                                      │
│  ┌──────────┐    ┌──────────────┐  │
│  │  Ollama  │◄───│  Open WebUI  │  │
│  │  :11434  │    │    :3000     │  │
│  └──────────┘    └───────┬──────┘  │
│                           │          │
│                           ▼          │
│                  ┌──────────────┐   │
│                  │   Backend    │   │
│                  │    :8432     │   │
│                  └──────┬───────┘   │
└─────────────────────────┼───────────┘
                          │
                          ▼
                  Google Maps API
```

## 🔐 Environment Variables

Edit `.env` file:

```env
# Required
GOOGLE_MAPS_API_KEY=your-key-here

# Optional - Open WebUI
WEBUI_SECRET_KEY=random-secret-key
ENABLE_SIGNUP=true

# Optional - Backend Security
API_KEY=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing API key - add to .env
# 2. Port 8432 in use - change in docker-compose.yml
```

### Container keeps restarting

```bash
# Check health
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 backend
```

### Can't connect to backend from Open WebUI

- Make sure all services are running: `docker-compose ps`
- Backend should be "healthy"
- Use service name `http://backend:8432` in Docker network

### Need to rebuild after code changes

```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild everything
docker-compose up -d --build
```

## 📝 Development vs Production

### Development (current setup)

```bash
# Edit .env
GOOGLE_MAPS_API_KEY=your-key
NODE_ENV=production

# Start
docker-compose up -d
```

### Local Development (outside Docker)

```bash
# Stop Docker backend
docker-compose stop backend

# Run locally
cd backend
npm run dev

# Update Python function to use localhost:8432
```

## 🚀 Deployment Ready

This Docker setup is production-ready:
- ✅ Multi-stage build (optimized image size)
- ✅ Health checks
- ✅ Auto-restart on failure
- ✅ Environment-based configuration
- ✅ Separated services
- ✅ Volume persistence

## 📦 What Gets Built

```
Docker Images:
- ollama/ollama:latest (~4GB)
- ghcr.io/open-webui/open-webui:main (~2GB)
- heypico-backend:latest (~200MB)

Total: ~6GB + models
```

## 🎯 Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# Pull LLM model
docker exec -it ollama ollama pull llama3.2

# View backend logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Stop everything
docker-compose down

# Rebuild after changes
docker-compose up -d --build backend

# Clean everything
docker-compose down -v
docker system prune -a
```

## ✅ Success Checklist

- [ ] Docker & Docker Compose installed
- [ ] Google Maps API key in `.env`
- [ ] `docker-compose up -d` completed
- [ ] All 3 services running (check with `docker-compose ps`)
- [ ] Backend is "healthy"
- [ ] Ollama model pulled
- [ ] Open WebUI accessible at localhost:3000
- [ ] Backend health check passes
- [ ] Python function added to Open WebUI
- [ ] Test query works

## 🎉 You're Done!

Everything is containerized and ready to go. Just:
1. Add your Google Maps API key to `.env`
2. Run `docker-compose up -d`
3. Pull an LLM model
4. Add the function to Open WebUI
5. Start chatting!

---

**Need help?** Check the logs with `docker-compose logs -f`
