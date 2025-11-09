.PHONY: help start stop restart logs pull-model status clean

help: ## Show this help message
	@echo "🚀 HeyPico Maps - Docker Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Start all services (Ollama, Open WebUI, Backend)
	@echo "🚀 Starting all services..."
	@docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo "   - Open WebUI: http://localhost:3210"
	@echo "   - Backend API: http://localhost:8432"
	@echo "   - Ollama: http://localhost:11434"
	@echo ""
	@echo "⏳ Pulling llama3.2 model (if not already installed)..."
	@./init-ollama.sh

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	@docker-compose down
	@echo "✅ All services stopped"

restart: stop start ## Restart all services

logs: ## Show logs from all services
	@docker-compose logs -f

logs-backend: ## Show backend logs only
	@docker-compose logs -f backend

logs-ollama: ## Show Ollama logs only
	@docker-compose logs -f ollama

logs-openwebui: ## Show Open WebUI logs only
	@docker-compose logs -f open-webui

pull-model: ## Pull llama3.2 model
	@echo "📥 Pulling llama3.2 model..."
	@docker exec ollama ollama pull llama3.2
	@echo "✅ Model installed!"

list-models: ## List installed Ollama models
	@docker exec ollama ollama list

status: ## Show status of all services
	@docker-compose ps

test-backend: ## Test backend health endpoint
	@echo "🧪 Testing backend..."
	@curl -s http://localhost:8432/api/maps/health | jq || curl http://localhost:8432/api/maps/health
	@echo ""

rebuild: ## Rebuild and restart backend
	@echo "🔨 Rebuilding backend..."
	@docker-compose up -d --build backend
	@echo "✅ Backend rebuilt!"

clean: ## Stop and remove all containers, volumes, and images
	@echo "🗑️  Cleaning up..."
	@docker-compose down -v
	@docker rmi test-backend 2>/dev/null || true
	@echo "✅ Cleanup complete"

shell-backend: ## Open shell in backend container
	@docker exec -it heypico-backend sh

shell-ollama: ## Open shell in Ollama container
	@docker exec -it ollama bash

# Default target
.DEFAULT_GOAL := help
