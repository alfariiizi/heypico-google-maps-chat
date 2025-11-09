# Complete Setup Guide - HeyPico Technical Test

This guide will help you set up the entire LLM + Google Maps integration system.

## 📋 Overview

You'll be setting up:
1. ✅ Ollama + Open WebUI (Already running)
2. 🔧 Backend API (Hono + TypeScript)
3. 🔗 Integration between LLM and Google Maps

## 🎯 Step-by-Step Setup

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Places API** (New)
   - **Directions API**
   - **Maps JavaScript API** (for embeds)
   - **Geocoding API** (recommended)

4. Create credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy your API key

5. (Optional but recommended) Restrict your API key:
   - Click on the API key you just created
   - Under **API restrictions**, select **Restrict key**
   - Select only the APIs you enabled above
   - Save

### Step 2: Configure Backend API

1. Navigate to backend directory:
```bash
cd backend
```

2. Edit the `.env` file:
```bash
# Open in your favorite editor
nano .env
# or
vim .env
# or
code .env
```

3. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
```env
GOOGLE_MAPS_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. Save the file

### Step 3: Start the Backend API

```bash
# Make sure you're in the backend directory
cd /home/alfarizi/dev/work/heypico/test/backend

# Start the development server
npm run dev
```

You should see:
```
🚀 Server starting on port 8432
📍 Environment: development
🔑 API Key authentication: disabled
⏱️  Rate limiting: 100 requests per 60000ms
✅ Server is running on http://localhost:8432
```

### Step 4: Test the Backend

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8432/api/maps/health

# Should return:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "timestamp": "2025-01-XX...",
#     "service": "Google Maps API Integration"
#   }
# }
```

Test a search:
```bash
curl -X POST http://localhost:8432/api/maps/search-places \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shops in San Francisco"}'
```

If you get results with place names and addresses, **YOU'RE GOOD TO GO!** ✅

### Step 5: Integrate with Open WebUI

#### Option A: Using Python Functions (Recommended)

1. Open your browser and go to Open WebUI: `http://localhost:3000`

2. Login to your account

3. Navigate to: **Workspace** → **Functions** (or **Tools**)

4. Click **"+" or "Create New Function"**

5. Copy the content from:
   ```
   /home/alfarizi/dev/work/heypico/test/backend/open-webui-functions/maps_functions.py
   ```

6. Paste it into the function editor

7. Give it a name: "Google Maps Integration"

8. Save and **Enable** the function

9. Make sure the function is enabled for your chat model

#### Option B: Manual Configuration

If Open WebUI doesn't support Python functions, configure as tools:

1. Go to **Settings** → **Tools** or **Function Calling**

2. Add three functions using the JSON files in `backend/open-webui-functions/`:
   - `search_places.json`
   - `get_directions.json`
   - `get_place_details.json`

3. For each function, set the endpoint URL to your backend API

### Step 6: Test the Complete Integration

1. In Open WebUI, start a new chat

2. Make sure you're using a model that supports function calling (llama3.2, mistral, etc.)

3. Try these prompts:

**Test 1: Search Places**
```
"Find me the best coffee shops in San Francisco"
```

The LLM should:
- Call `search_places` function
- Get results from your backend
- Display place names, ratings, and Google Maps links
- Potentially show an embedded map

**Test 2: Get Directions**
```
"How do I get from Golden Gate Bridge to Fisherman's Wharf?"
```

The LLM should:
- Call `get_directions` function
- Return distance, duration, and route
- Provide a Google Maps link

**Test 3: Place Details**
```
"Tell me more about the first coffee shop you found"
```

The LLM should:
- Extract the placeId from previous results
- Call `get_place_details` function
- Show detailed info, reviews, opening hours

## 🎉 Success Criteria

You know it's working when:
- ✅ Backend server starts without errors
- ✅ Health check returns "healthy"
- ✅ LLM calls the Google Maps functions automatically
- ✅ You see actual place results with Google Maps links
- ✅ Embedded maps or clickable links appear in the chat

## 🐛 Troubleshooting

### Backend won't start

**Error: "Missing or invalid environment variables"**
- Solution: Make sure `GOOGLE_MAPS_API_KEY` is set in `.env`

**Error: "EADDRINUSE: Port 8432 already in use"**
- Solution: Change `PORT` in `.env` to another port (e.g., 3002)

### LLM isn't calling functions

**Issue: LLM responds normally but doesn't call functions**
1. Check that functions are enabled in Open WebUI
2. Verify the function is enabled for your model
3. Try a model that supports function calling (llama3.2, mistral)
4. Be explicit: "Use the search_places function to find..."

### Google Maps API Errors

**Error: "INVALID_REQUEST"**
- Check your API key is correct
- Make sure APIs are enabled in Google Cloud Console

**Error: "REQUEST_DENIED"**
- Enable required APIs (Places API, Directions API)
- Check API key restrictions

**Error: "OVER_QUERY_LIMIT"**
- You've exceeded free tier quota
- Enable billing or wait for quota reset

## 📊 Architecture Diagram

```
┌─────────────┐
│    User     │
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│    Open WebUI       │
│  (localhost:3000)   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│   Local LLM         │
│   (Ollama)          │
│   - llama3.2        │
│   - mistral         │
└──────┬──────────────┘
       │ Function Call
       ↓
┌─────────────────────┐
│  Backend API        │
│  (localhost:8432)   │
│  Hono + TypeScript  │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Google Maps API    │
│  - Places           │
│  - Directions       │
└─────────────────────┘
```

## 🎯 Demo Script for Presentation

Use this script to demonstrate your solution:

1. **Show the architecture**
   - "I built a system that connects a local LLM with Google Maps API"

2. **Show the backend code**
   - "Here's the backend API built with Hono and TypeScript"
   - Point out: Type safety, error handling, rate limiting, security

3. **Show the integration**
   - "The LLM can automatically call Google Maps functions"

4. **Live demo**
   - Ask: "Find me Italian restaurants in New York"
   - Show: Results with ratings, addresses, and maps
   - Ask: "How do I get to the first one?"
   - Show: Directions with distance and time

5. **Highlight best practices**
   - ✅ Type-safe with TypeScript
   - ✅ Input validation with Zod
   - ✅ API key security (not exposed to client)
   - ✅ Rate limiting to prevent abuse
   - ✅ Proper error handling
   - ✅ Clean code architecture
   - ✅ Comprehensive documentation

## 📚 Files to Submit

Make sure to include:
1. ✅ `backend/` - All source code
2. ✅ `docker-compose.yml` - Ollama + Open WebUI setup
3. ✅ `README.md` - Main documentation
4. ✅ `SETUP_GUIDE.md` - This file
5. ✅ `.env.example` - Environment template
6. ✅ `open-webui-functions/` - Integration code

**DO NOT include:**
- ❌ `.env` with your actual API key
- ❌ `node_modules/`
- ❌ `.git/` (if you're not using git)

## 🚀 Good Luck!

You've built a production-quality integration that demonstrates:
- Full-stack development skills
- API design and integration
- LLM and AI integration
- Security best practices
- Clean code and documentation

This is impressive work that shows you can handle complex technical challenges!
