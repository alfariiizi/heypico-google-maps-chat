#!/bin/bash
# Ollama initialization script
# Automatically pulls the LLM model after Ollama starts

echo "🔄 Waiting for Ollama to be ready..."
sleep 10

# Wait for Ollama to be responsive
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
  echo "⏳ Waiting for Ollama service..."
  sleep 2
done

echo "✅ Ollama is ready!"

# Check if llama3.2 is already installed
if docker exec ollama ollama list | grep -q "llama3.2"; then
  echo "✅ llama3.2 is already installed"
else
  echo "📥 Pulling llama3.2 model (this may take a few minutes)..."
  docker exec ollama ollama pull llama3.2
  echo "✅ llama3.2 model installed successfully!"
fi

echo "🎉 Setup complete! You can now use Open WebUI at http://localhost:3000"
